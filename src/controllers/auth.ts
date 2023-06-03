import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  AccountLogin_Plain_Request,
  AccountLogin_Plain_Request_DTO,
  Authorize_Request,
  Authorize_Request_DTO,
  DiscordCallback_Request,
  DiscordCallback_Request_DTO,
  RegisterSocial_Request,
  RegisterSocial_Request_DTO,
  TwoFactorVerify_Request,
  TwoFactorVerify_Request_DTO,
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
import { ClientScope } from "../types/client";
import JwtService from "../services/jwt";
import { AccessToken_Request, AccessToken_Request_DTO } from "../types/jwt";

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
        Querystring: Authorize_Request;
      }>,
      reply: FastifyReply
    ) => {
      request.session.set("client", undefined);
      request.session.set("redirect_uri", undefined);
      request.session.set("social_user", undefined);
      request.session.set("social_type", undefined);
      request.session.set("two_factor_user", undefined);
      request.session.set("scopes", undefined);

      const data = new Authorize_Request_DTO(request.query);
      await validateBody(data);

      const { redirect_uri, client_id, scope } = data;

      const scopes = scope.replace(/%20/g, " ").split(" ") as ClientScope[];

      const client = await ClientService.find(client_id);
      const clientService = new ClientService(request, reply, client);

      await clientService.validateRedirectUri(redirect_uri);
      await clientService.validateScopes(scopes);
      await clientService.requestAuthorization(redirect_uri, scopes);

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
        Body: RegisterSocial_Request;
      }>,
      reply: FastifyReply
    ) => {
      const { social_type, social_user } = request.session;
      if (!social_type || !social_user) {
        throw new UnprocessableEntityException(
          "Social type and user not found. Your identity session may have expired."
        );
      }

      const body = new RegisterSocial_Request_DTO(request.body);
      await validateBody(body);

      const { username, email } = body;

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
        Querystring: DiscordCallback_Request;
      }>,
      reply: FastifyReply
    ) => {
      const data = new DiscordCallback_Request_DTO(request.query);
      await validateBody(data);

      const { code, error } = data;
      if (error) {
        return reply.redirect("/login?error=The user denied the request.");
      }

      const token = await discordOauth2.tokenRequest({
        code,
        scope: ["identify", "email"],
        grantType: "authorization_code",
      });
      const discordUser = await discordOauth2.getUser(token.access_token);

      const user = await new AccountService(request, reply).findByDiscordId(
        discordUser.id
      );

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
        Body: TwoFactorVerify_Request;
      }>,
      reply: FastifyReply
    ) => {
      await new AuthGuards(request, reply).mustNotBeAuthenticated();

      const body = new TwoFactorVerify_Request_DTO(request.body);
      await validateBody(body);

      const { code } = request.body;

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
    "/token",
    async (
      request: FastifyRequest<{
        Body: AccessToken_Request;
      }>,
      reply: FastifyReply
    ) => {
      await new AuthGuards(request, reply).mustNotBeAuthenticated();

      const body = new AccessToken_Request_DTO(request.body);
      await validateBody(body);

      const { code, redirect_uri, client_id, client_secret } = body;
      const token = await new JwtService(request, reply).signAccessToken({
        code,
        redirect_uri,
        client_id,
        client_secret,
      });
      return reply.send(token);
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
