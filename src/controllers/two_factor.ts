import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import TwoFactorService from "../services/two_factor";
import JwtGuard from "../guards/jwt";
import { ClientScope } from "../types/client";

const TwoFactorController = (
  instance: FastifyInstance,
  opts: FastifyPluginOptions,
  done: () => void
) => {
  instance.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const jwtGuard = new JwtGuard(request, reply);
    await jwtGuard.mustHaveScopes([ClientScope.AccountRead]);
    const user = await jwtGuard.getUser();

    const twoFactorService = new TwoFactorService(request, reply, user);
    const data = await twoFactorService.getState();

    return reply.send(data);
  });

  done();
};

export default TwoFactorController;
