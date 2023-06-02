import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  AccountLogin_Plain_Request,
  AccountLogin_Plain_Request_DTO,
} from "../types/auth";

import DiscordOauth2 from "discord-oauth2";
import AccountService from "../services/account";
import AuthService from "../services/auth";
import AuthGuards from ".././guards/auth";
import { UnprocessableEntityException } from "../utils/http_exceptions";
import { validateBody } from "../utils/validators";
import ClientService from "../services/client";
import TwoFactorService from "../services/two_factor";
import Environment from "../environment";

import JWT from "../utils/jwt";
import { ClientScope } from "../types/client";

const discordOauth2 = new DiscordOauth2({
  clientId: Environment.discord.client_id,
  clientSecret: Environment.discord.client_secret,
  redirectUri: Environment.discord.redirect_uri,
});

const AuthController = (
  instance: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) => {
  instance.get(
    "/authorize",
    async (
      request: FastifyRequest<{
        Querystring: {
          client_id: string;
          redirect_uri: string;
          scope: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      request.session.set("client", undefined);
      request.session.set("redirect_uri", undefined);
      request.session.set("social_user", undefined);
      request.session.set("social_type", undefined);
      request.session.set("two_factor_user", undefined);

      const { redirect_uri, client_id, scope } = request.query;
      if (!redirect_uri || !client_id || !scope) {
        throw new UnprocessableEntityException("Missing data");
      }

      const scopes = scope.replace(/%20/g, " ").split(" ") as ClientScope[];

      const client = await ClientService.find(client_id);
      const clientService = new ClientService(request, reply, client);

      await clientService.validateRedirectUri(redirect_uri);
      await clientService.validateScopes(scopes);
      await clientService.requestAuthorization(redirect_uri);
      return reply.redirect("/login");
    }
  );

  instance.get(
    "/finish",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.session.get("user");
      const client = request.session.get("client");
      const redirect_uri = request.session.get("redirect_uri");

      if (!user || !client || !redirect_uri) {
        throw new UnprocessableEntityException("User or client not found");
      }

      await new ClientService(request, reply, client).finishAuthorization();
    }
  );

  instance.post(
    "/login",
    async (
      request: FastifyRequest<{
        Body: AccountLogin_Plain_Request;
      }>,
      reply: FastifyReply
    ) => {
      await new AuthGuards(request, reply).mustNotBeAuthenticated();

      const body = new AccountLogin_Plain_Request_DTO(request.body);
      await validateBody(body);

      const user = await new AccountService(request, reply).findByParameter(
        body.parameter
      );

      if (user.password !== body.password) {
        throw new UnprocessableEntityException("Invalid credentials");
      }

      await new AuthService(request, reply, user).login();

      return reply.send();
    }
  );

  instance.post(
    "/register/social",
    async (
      request: FastifyRequest<{
        Body: {
          username: string;
          email: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      const { social_type, social_user } = request.session;
      if (!social_type || !social_user) {
        throw new UnprocessableEntityException(
          "Social type and user not found. Your identity session may have expired."
        );
      }

      const { username, email } = request.body;
      if (!username || !email) {
        throw new UnprocessableEntityException(
          "Username and email are required"
        );
      }

      const user = await new AccountService(request, reply).create({
        username,
        email,
        connections: {
          [social_type]: {
            id: social_user,
          },
        },
      });

      await new AuthService(request, reply, user).login();
      return reply.send();
    }
  );

  instance.get(
    "/discord/callback",
    async (
      request: FastifyRequest<{
        Querystring: {
          code?: string;
          error?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      const { code, error } = request.query;
      if (error) {
        return reply.redirect("/login?error=The user denied the request.");
      }

      if (!code) {
        return reply.redirect(
          "/login?error=No code was returned from Discord."
        );
      }

      const token = await discordOauth2.tokenRequest({
        code,
        scope: ["identify", "email"],
        grantType: "authorization_code",
      });
      const discordUser = await discordOauth2.getUser(token.access_token);

      let user;
      try {
        user = await new AccountService(request, reply).findByDiscordId(
          discordUser.id
        );
      } catch {
        /* empty */
      }

      if (!user) {
        await request.session.set("social_user", discordUser.id);
        await request.session.set("social_type", "discord");

        return reply.redirect("/register");
      }

      await new AuthService(request, reply, user).login();
      return reply.redirect("/request");
    }
  );

  instance.get(
    "/discord",
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.session.get("client")) {
        return reply.redirect("/request");
      }
      reply.redirect(
        discordOauth2.generateAuthUrl({ scope: ["identify", "email"] })
      );
    }
  );

  instance.post(
    "/2fa/verify",
    async (
      request: FastifyRequest<{
        Body: {
          code?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      await new AuthGuards(request, reply).mustNotBeAuthenticated();

      const { code } = request.body;
      if (!code) {
        throw new UnprocessableEntityException("Invalid code");
      }

      const { two_factor_user } = request.session;
      if (!two_factor_user) {
        throw new UnprocessableEntityException("Invalid session id");
      }

      await new TwoFactorService(
        request,
        reply,
        two_factor_user
      ).validateSession(code);

      return reply.send();
    }
  );

  instance.post(
    "/2fa/device",
    async (
      request: FastifyRequest<{
        Body: {
          name: string;
        };
      }>,
      reply: FastifyReply
    ) => {}
  );

  instance.post(
    "/access-token",
    async (
      request: FastifyRequest<{
        Body: {
          code?: string;
          redirect_uri?: string;
          client_id?: string;
          client_secret?: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      await new AuthGuards(request, reply).mustNotBeAuthenticated();

      const { code, redirect_uri, client_id, client_secret } = request.body;

      if (!code || !redirect_uri || !client_id || !client_secret) {
        throw new UnprocessableEntityException("Missing data");
      }

      const result = JWT.verifyCode(code);

      const client = await ClientService.find(client_id);
      if (client.secret !== client_secret) {
        throw new UnprocessableEntityException("Invalid client secret");
      }

      if (!client.redirect_uris.includes(redirect_uri)) {
        throw new UnprocessableEntityException("Invalid redirect uri");
      }

      const accessToken = JWT.signAccessToken(result);
      return reply.send({
        access_token: accessToken,
      });
    }
  );

  instance.get(
    "/logout",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await request.session.destroy();
      return reply.redirect("/");
    }
  );

  done();
};

export default AuthController;
