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
import TwoFactorController from "./controllers/two_factor";
import { RedisClientType } from "redis";

import RedisStore from "connect-redis";

declare module "fastify" {
  interface FastifyInstance {
    redisClient: RedisClientType;
  }
}

class IdentityServer {
  private fastify: FastifyInstance = Fastify({
    logger: false,
  });
  private app!: NextServer;

  constructor(private readonly redisClient: RedisClientType) {
    this.fastify.decorate("redisClient", this.redisClient);
  }

  public async start() {
    await this.fastify.register(FastifyCookie);
    await this.fastify.register(FastifySession, {
      secret: Environment.sessionSecret,
      store: new RedisStore({
        client: this.redisClient,
        prefix: "session:",
      }),
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
      if (req.session.get("two_factor_user")) {
        return reply.redirect("/2fa");
      }
      if (req.session.get("social_user")) {
        return reply.redirect("/register");
      }
      if (!req.session.get("user")) {
        return app.render(req.raw, reply.raw, "/login", {});
      } else {
        return reply.redirect("/request");
      }
    });

    this.fastify.get(
      "/register",
      (req: FastifyRequest, reply: FastifyReply) => {
        if (!req.session.get("client") || !req.session.get("redirect_uri")) {
          return app.render(req.raw, reply.raw, "/client_died", {});
        }
        if (req.session.get("two_factor_user")) {
          return reply.redirect("/2fa");
        }
        if (req.session.get("user")) {
          return reply.redirect("/request");
        }

        return app.render(req.raw, reply.raw, "/register", {
          social_type: req.session.get("social_type"),
          social_user: req.session.get("social_user"),
        });
      }
    );

    this.fastify.get("/request", (req: FastifyRequest, reply: FastifyReply) => {
      if (!req.session.get("user")) {
        return reply.redirect("/login");
      }
      if (!req.session.get("client") || !req.session.get("redirect_uri")) {
        return app.render(req.raw, reply.raw, "/client_died", {});
      }
      if (req.session.get("two_factor_user")) {
        return reply.redirect("/2fa");
      }
      return app.render(req.raw, reply.raw, "/client_request", {
        user: req.session.get("user"),
        client: req.session.get("client"),
        redirect_uri: req.session.get("redirect_uri"),
      });
    });

    this.fastify.get("/2fa", (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.session.two_factor_user) {
        return reply.redirect("/login");
      }
      return app.render(request.raw, reply.raw, "/two_factor", {
        user: request.session.get("two_factor_user"),
      });
    });

    this.app = app;
  }

  private async injectControllers() {
    this.fastify.register(AuthController, { prefix: "/api/auth" });
    this.fastify.register(TwoFactorController, { prefix: "/api/2fa" });
  }
}

export default IdentityServer;
