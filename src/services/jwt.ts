import { FastifyReply, FastifyRequest } from "fastify";
import JWT from "../utils/jwt";
import ClientService from "./client";
import {
  UnauthorizedException,
  UnprocessableEntityException,
} from "../utils/http_exceptions";
import { RedisClientType } from "redis";

class JwtService {
  constructor(
    private readonly request: FastifyRequest,
    private readonly reply: FastifyReply,
    private readonly redisClient: RedisClientType
  ) {}

  public async signAccessToken({
    code,
    redirect_uri,
    client_id,
    client_secret,
  }: {
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret: string;
  }) {
    const code_used = await this.redisClient.exists(`code:${code}`);
    if (code_used) throw new UnauthorizedException();

    const result = JWT.verifyCode(code);
    await this.redisClient.setEx(`code:${code}`, 60 * 5, "used");

    const client = await ClientService.find(client_id);
    if (client.secret !== client_secret) {
      throw new UnprocessableEntityException("Invalid client secret");
    }

    if (!client.redirect_uris.includes(redirect_uri)) {
      throw new UnprocessableEntityException("Invalid redirect uri");
    }

    const accessToken = JWT.signAccessToken(result);

    const access_tokens = this.request.session.get("access_tokens") || [];
    access_tokens.push(accessToken);
    this.request.session.set("access_tokens", access_tokens);

    return {
      access_token: accessToken,
    };
  }
}

export default JwtService;
