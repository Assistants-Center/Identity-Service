import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";

class AuthGuards<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>
  ) {}

  public async mustBeAuthenticated() {
    if (!this.request.session.get("user")) {
      throw new Error("Unauthorized");
    }
  }

  public async mustNotBeAuthenticated() {
    if (this.request.session.get("user")) {
      throw new Error("Not allowed");
    }
  }
}

export default AuthGuards;
