import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import Next from "next";

import Environment, { EnvironmentType } from "./environment";
import path from "path";

class IdentityServer {
  public fastify: FastifyInstance = Fastify({
    logger: false,
  });

  public async start() {
    const app = Next({
      dev: Environment.type === EnvironmentType.Development,
      port: Environment.port,
      hostname: "0.0.0.0",
      quiet: false,
      dir: path.join(__dirname, "../client"),
    });

    const handle = app.getRequestHandler();
    await app.prepare();

    this.fastify.get("/_next/*", (req: FastifyRequest, reply: FastifyReply) => {
      return handle(req.raw, reply.raw).then(() => {
        reply.hijack();
      });
    });

    this.fastify.get(
      "*",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return app.render(request.raw, reply.raw, "/", {});
      }
    );

    await this.fastify.listen({
      port: Environment.port,
      host: "0.0.0.0",
    });
  }
}

export default IdentityServer;
