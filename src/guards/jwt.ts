import { FastifyReply, FastifyRequest } from "fastify";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../utils/http_exceptions";
import JWT from "../utils/jwt";
import User from "../schemas/user";
import { UserRole } from "../../client_module";
import { ClientScope } from "../types/client";

class JwtGuard {
  constructor(
    private readonly request: FastifyRequest,
    private readonly reply: FastifyReply
  ) {}

  public getUserPayload() {
    const token = this.request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new UnauthorizedException();
    }

    const userPayload = JWT.verifyAccessToken(token);
    if (!userPayload) {
      throw new UnauthorizedException();
    }

    return userPayload;
  }
  public async getUser() {
    const userPayload = await this.getUserPayload();
    const user = await User.findById(userPayload.user_id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  public async mustBeAuthenticated() {
    const token = this.request.headers.authorization;
    if (!token) {
      throw new UnauthorizedException();
    }

    const user = await JWT.verifyAccessToken(token);
    if (!user) {
      throw new UnauthorizedException();
    }
  }

  public mustHaveScopes(scopes: string[]) {
    const user = this.getUserPayload();

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
