import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import Next from "next";

import FastifyCookie from "@fastify/cookie";
import FastifySession from "@fastify/session";

import Environment, { EnvironmentType } from "./environment";
import path from "path";
import { NextServer } from "next/dist/server/next";

import AuthController from "./controllers/auth";

class IdentityServer {
  private fastify: FastifyInstance = Fastify({
    logger: false,
  });

  private app!: NextServer;

  public async start() {
    await this.fastify.register(FastifyCookie);
    await this.fastify.register(FastifySession, {
      secret: Environment.sessionSecret,
    });

    await this.prepareNext();
    await this.injectControllers();

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

  private async injectControllers() {
    this.fastify.register(AuthController, { prefix: "/api/auth" });
  }
}

export default IdentityServer;
