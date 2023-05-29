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

const AuthController = (
  instance: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) => {
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
