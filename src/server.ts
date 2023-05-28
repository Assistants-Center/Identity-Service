import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import Next from "next";

import Environment, { EnvironmentType } from "./environment";
import path from "path";
import { NextServer } from "next/dist/server/next";

class IdentityServer {
  private fastify: FastifyInstance = Fastify({
    logger: false,
  });

  private app!: NextServer;

  public async start() {
    await this.prepareNext();

    this.fastify.get(
      "/",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return this.app.render(request.raw, reply.raw, "/", {});
      }
    );

    await this.fastify.listen({
      port: Environment.port,
      host: "0.0.0.0",
    });
  }

  private async prepareNext() {
    const app = Next({
      dev: Environment.type === EnvironmentType.Development,
      port: Environment.port,
      hostname: "0.0.0.0",
      quiet: Environment.type === EnvironmentType.Production,
      dir: path.join(__dirname, "../client"),
    });

    const handle = app.getRequestHandler();
    await app.prepare();

    this.fastify.get("/_next/*", (req: FastifyRequest, reply: FastifyReply) => {
      return handle(req.raw, reply.raw).then(() => {
        reply.hijack();
      });
    });

    this.app = app;
  }
}

export default IdentityServer;
