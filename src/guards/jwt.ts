import { FastifyReply, FastifyRequest } from "fastify";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../utils/http_exceptions";
import JWT from "../utils/jwt";
import User from "../schemas/user";
import { UserRole } from "../../client_module";
import { ClientScope } from "../types/client";
import { RedisClientType } from "redis";

class JwtGuard {
  constructor(
    private readonly request: FastifyRequest,
    private readonly reply: FastifyReply,
    private readonly redisClient: RedisClientType
  ) {}

  public async getUserPayload() {
    const token = this.request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new UnauthorizedException("Token is missing");
    }

    const expired = await this.redisClient.exists(`access_token:${token}`);
    if (expired) throw new UnauthorizedException("Access Token revoked");

    const userPayload = JWT.verifyAccessToken(token);
    if (!userPayload) {
      throw new UnauthorizedException("User payload invalid");
    }

    return userPayload;
  }
  public async getUser() {
    const userPayload = await this.getUserPayload();
    const user = await User.findById(userPayload.user_id);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return user;
  }

  public async mustBeAuthenticated() {
    const token = this.request.headers.authorization;
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await JWT.verifyAccessToken(token);
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }

  public async mustHaveScopes(scopes: string[]) {
    const user = await this.getUserPayload();

    if (!scopes.includes(ClientScope.Admin)) {
      const valid = scopes.every((scope) => user.scopes.includes(scope));
      if (!valid) {
        throw new ForbiddenException("Scope not allowed");
      }
    }
  }

  public async mustHaveRole(role: UserRole) {
    const user = await this.getUser();
    if (!user.roles.includes(role))
      throw new ForbiddenException("Role not allowed");
  }
}

export default JwtGuard;
