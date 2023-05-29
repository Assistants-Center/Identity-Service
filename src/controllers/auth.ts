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

import AccountService from "../services/account";
import AuthService from "../services/auth";
import AuthGuards from ".././guards/auth";
import { UnprocessableEntityException } from "../utils/http_exceptions";
import { validateBody } from "../utils/validators";
import ClientService from "../services/client";
import TwoFactorService from "../services/two_factor";

const AuthController = (
  instance: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) => {
  instance.get(
    "/request",
    async (
      request: FastifyRequest<{
        Querystring: {
          client_id: string;
          redirect_uri: string;
        };
      }>,
      reply: FastifyReply
    ) => {
      const client = await ClientService.find(request.query.client_id);
      await new ClientService(request, reply, client).validateRedirectUri(
        request.query.redirect_uri
      );
      await new ClientService(request, reply, client).requestAuthorization(
        request.query.redirect_uri
      );
      return reply.redirect("/login");
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
    "/2fa/verify",
    async (
      request: FastifyRequest<{
        Body: {
          code: string;
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
      ).validate2FASession(code);

      return reply.send();
    }
  );

  instance.post(
    "/logout",
    async (request: FastifyRequest, reply: FastifyReply) => {
      await request.session.destroy();
    }
  );

  done();
};

export default AuthController;
