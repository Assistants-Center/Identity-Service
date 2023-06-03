import { FastifyReply, FastifyRequest } from "fastify";
import JWT from "../utils/jwt";
import ClientService from "./client";
import { UnprocessableEntityException } from "../utils/http_exceptions";

class JwtService {
  constructor(
    private readonly request: FastifyRequest,
    private readonly reply: FastifyReply
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
    const result = JWT.verifyCode(code);

    const client = await ClientService.find(client_id);
    if (client.secret !== client_secret) {
      throw new UnprocessableEntityException("Invalid client secret");
    }

    if (!client.redirect_uris.includes(redirect_uri)) {
      throw new UnprocessableEntityException("Invalid redirect uri");
    }

    const accessToken = JWT.signAccessToken(result);
    return {
      access_token: accessToken,
    };
  }
}

export default JwtService;
