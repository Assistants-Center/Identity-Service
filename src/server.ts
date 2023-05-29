import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import Next from "next";

import FastifyCookie from "@fastify/cookie";
import FastifySession from "@fastify/session";
import FastifyMultipart from "@fastify/multipart";

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

    await this.fastify.register(FastifyMultipart, {
      addToBody: true,
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

    this.fastify.get("/login", (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.session.get("client") || !req.session.get("redirect_uri")) {
        return app.render(req.raw, reply.raw, "/client_died", {});
      }
      if (!req.session.get("user")) {
        return app.render(req.raw, reply.raw, "/login", {});
      } else {
        return reply.redirect("/request");
      }
    });

    this.fastify.get("/request", (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.session.get("user")) {
        return reply.redirect("/login");
      }
      if (!req.session.get("client") || !req.session.get("redirect_uri")) {
        return app.render(req.raw, reply.raw, "/client_died", {});
      }
      return app.render(req.raw, reply.raw, "/client_request", {
        user: req.session.get("user"),
        client: req.session.get("client"),
        redirect_uri: req.session.get("redirect_uri"),
      });
    });

    this.app = app;
  }

  private async injectControllers() {
    this.fastify.register(AuthController, { prefix: "/api/auth" });
  }
}

export default IdentityServer;
