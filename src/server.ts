import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import Environment from "./environment";

class IdentityServer {
  public fastify: FastifyInstance = Fastify({
    logger: false,
  });

  public async start() {
    this.fastify.get(
      "*",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return { hello: "world" };
      }
    );

    await this.fastify.listen({
      port: Environment.port,
      host: "0.0.0.0",
    });
  }
}

export default IdentityServer;
