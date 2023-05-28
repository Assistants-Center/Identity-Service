import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../utils/http_exceptions";

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
      throw new UnauthorizedException();
    }
  }

  public async mustNotBeAuthenticated() {
    if (this.request.session.get("user")) {
      throw new ForbiddenException("You are already authenticated");
    }
  }
}

export default AuthGuards;
