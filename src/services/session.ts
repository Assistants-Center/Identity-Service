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
import { RedisClientType } from "redis";

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

    access_tokens: string[];

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
    private readonly redisClient: RedisClientType,
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

  public async logoutOnlyUser() {
    const access_tokens = this.request.session.get("access_tokens") || [];
    for (const token of access_tokens) {
      await this.redisClient.setEx(
        `access_token:${token}`,
        60 * 60 * 24 * 7,
        "used"
      );
    }

    await this.request.session.set("user", undefined);
    this.request.session.set("social_user", undefined);
    this.request.session.set("social_type", undefined);
    this.request.session.set("two_factor_user", undefined);
  }

  public async destroyClientSession() {
    this.request.session.set("social_user", undefined);
    this.request.session.set("social_type", undefined);
    this.request.session.set("two_factor_user", undefined);
    this.request.session.set("client", undefined);
    this.request.session.set("redirect_uri", undefined);
    this.request.session.set("scopes", undefined);
  }

  public async logout() {
    const access_tokens = this.request.session.get("access_tokens") || [];
    for (const token of access_tokens) {
      await this.redisClient.setEx(
        `access_token:${token}`,
        60 * 60 * 24 * 7,
        "used"
      );
    }

    await this.request.session.destroy();
  }
}

export default SessionService;
