import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user";
import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import SessionService from "./session";
import TwoFactorService from "./two_factor";
import { RedisClientType } from "redis";

class AuthService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  private readonly sessionService: SessionService<Request, Reply>;
  private readonly twoFactorService: TwoFactorService<Request, Reply>;
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly redisClient: RedisClientType,
    private readonly user: HydratedDocument<IUser>
  ) {
    this.sessionService = new SessionService(
      request,
      reply,
      this.redisClient,
      user
    );
    this.twoFactorService = new TwoFactorService(
      request,
      reply,
      this.redisClient,
      user
    );
  }

  public async login() {
    if (this.user.two_factor.enabled) {
      await this.twoFactorService.createUser2FASession();
      return true;
    } else {
      await this.sessionService.saveUser();
      return false;
    }
  }
}

export default AuthService;
