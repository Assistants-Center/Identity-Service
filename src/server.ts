import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import Next from "next"

import Environment from "./environment";

class IdentityServer {
  public fastify: FastifyInstance = Fastify({
    logger: false,
  });

public async start() {
    const port = 3000
    const hostname = "0.0.0.0"
    const dev = true
    const app = Next({
        dev,
        port,
        hostname,
        quiet: false
    })

    const handle = app.getRequestHandler()
    app.prepare()

    this.fastify.get("/_next/*", (req: FastifyRequest, reply: FastifyReply) => {
        return handle(req.raw, reply.raw).then(() => {
            reply.hijack()
        })
    })
    
    this.fastify.get(
      "*",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return app.render(request.raw, reply.raw, "/")
      }
    );

    await this.fastify.listen({
      port: Environment.port,
      host: "0.0.0.0",
    });
  }
}

export default IdentityServer;
