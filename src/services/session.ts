import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user";
import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import { ClientScope, IClient } from "../types/client";
import { UnprocessableEntityException } from "../utils/http_exceptions";

export enum SocialType {
  DISCORD = "discord",
  GOOGLE = "google",
}

declare module "fastify" {
  interface Session {
    user: HydratedDocument<IUser>;
    client: HydratedDocument<IClient>;
    redirect_uri: string;
    two_factor_user: HydratedDocument<IUser>;

    social_type: SocialType;
    social_user: string;

    scopes: ClientScope[];
  }
}

class SessionService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly user?: HydratedDocument<IUser>
  ) {}

  public async saveUser() {
    if (!this.user) {
      throw new UnprocessableEntityException("User not found");
    }
    await this.request.session.set("user", this.user);
  }

  public async saveClient(
    client: HydratedDocument<IClient>,
    redirect_uri: string,
    scopes: ClientScope[]
  ) {
    await this.request.session.set("client", client);
    await this.request.session.set("redirect_uri", redirect_uri);
    await this.request.session.set("scopes", scopes);
  }
}

export default SessionService;
