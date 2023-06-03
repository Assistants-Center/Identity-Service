import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import { HydratedDocument } from "mongoose";
import { IUser } from "../types/user";

import Node2FA from "node-2fa";

import { UnprocessableEntityException } from "../utils/http_exceptions";
import SessionService from "./session";

import * as Crypto from "crypto";
import { RedisClientType } from "redis";

class TwoFactorService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly redisClient: RedisClientType,
    private readonly user: HydratedDocument<IUser>
  ) {}

  public async getState() {
    return this.user.two_factor;
  }

  public async createUser2FASession() {
    this.request.session.set("two_factor_user", this.user);
  }

  public validateCode(code: string) {
    const valid = this.user.two_factor.devices
      .filter((device) => device.verified)
      .some((device) => {
        const result = Node2FA.verifyToken(device.secret, code);
        return !!result;
      });

    if (!valid) {
      throw new UnprocessableEntityException("Invalid 2FA code");
    }
  }

  public async validateSession(code: string) {
    const { two_factor_user } = this.request.session;
    if (!two_factor_user) {
      throw new UnprocessableEntityException("2FA session not found");
    }

    this.validateCode(code);

    await new SessionService(
      this.request,
      this.reply,
      this.redisClient,
      two_factor_user
    ).saveUser();

    await this.request.session.set("two_factor_user", undefined);
  }

  public async disable2FA(code: string) {
    this.validateCode(code);

    this.user.two_factor.enabled = false;
    await this.user.save();
  }

  public async enable2FA(code: string) {
    this.validateCode(code);

    this.user.two_factor.enabled = true;
    await this.user.save();
  }

  public async createDevice(name: string, code?: string) {
    if (this.user.two_factor.devices.length >= 5) {
      throw new UnprocessableEntityException(
        "You can only have 5 devices at a time"
      );
    }

    const enabled = this.user.two_factor.enabled;
    if (enabled) {
      if (!code)
        throw new UnprocessableEntityException(
          "2FA is enabled, to add a new device you must provide a code"
        );

      this.validateCode(code);
    }

    const secret = Node2FA.generateSecret({
      name: "Assistants' Center Identity",
      account: this.user.username,
    });

    const id = Crypto.randomUUID();

    this.user.two_factor.devices.push({
      id,
      name,
      secret: secret.secret,
      verified: false,
    });

    await this.user.save();

    return {
      id,
      name,
      qr: secret.qr,
    };
  }

  public async verifyDevice(id: string, code: string) {
    const device = this.user.two_factor.devices.find(
      (device) => device.id === id
    );
    if (!device) {
      throw new UnprocessableEntityException("Device not found");
    }

    if (device.verified) {
      throw new UnprocessableEntityException("Device already verified");
    }

    const result = Node2FA.verifyToken(device.secret, code);
    if (!result) {
      throw new UnprocessableEntityException("Invalid code");
    }

    device.verified = true;
    await this.user.save();
  }

  public async deleteDevice(id: string, code: string) {
    const device = this.user.two_factor.devices.find(
      (device) => device.id === id
    );
    if (!device) {
      throw new UnprocessableEntityException("Device not found");
    }

    const result = Node2FA.verifyToken(device.secret, code);
    if (!result) {
      throw new UnprocessableEntityException("Invalid code");
    }

    this.user.two_factor.devices = this.user.two_factor.devices.filter(
      (device) => device.id !== id
    );
    await this.user.save();
  }
}

export default TwoFactorService;
