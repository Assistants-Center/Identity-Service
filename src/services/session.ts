import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user";
import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";

declare module "fastify" {
  interface Session {
    user: HydratedDocument<IUser>;
  }
}

class SessionService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly user: HydratedDocument<IUser>
  ) {}

  public async saveUser() {
    this.request.session.set("user", this.user);
  }
}

export default SessionService;
