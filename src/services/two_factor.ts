import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user";

import Crypto from "crypto";

import { UnprocessableEntityException } from "../utils/http_exceptions";
import SessionService from "./session";

class TwoFactorService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly user: HydratedDocument<IUser>
  ) {}

  public async createUser2FASession() {
    const session_id = Crypto.randomUUID();
    this.request.session.set("two_factor_user", this.user);
    return session_id;
  }

  public async validate2FASession(code: string) {
    const { two_factor_user } = this.request.session;
    if (!two_factor_user) {
      throw new UnprocessableEntityException("2FA session not found");
    }

    if (
      !two_factor_user.two_factor.devices.some((device) => {
        if (device.name === code) {
          return true;
        }
      })
    ) {
      throw new UnprocessableEntityException("Invalid 2FA code");
    }

    await new SessionService(
      this.request,
      this.reply,
      two_factor_user
    ).saveUser();

    await this.request.session.set("two_factor_user", undefined);
  }
}

export default TwoFactorService;
