import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import Client from "../schemas/client";
import { UnprocessableEntityException } from "../utils/http_exceptions";
import { HydratedDocument } from "mongoose";
import { ClientScope, IClient } from "../types/client";
import SessionService from "./session";
import JWT from "../utils/jwt";
import { RedisClientType } from "redis";

class ClientService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly redisClient: RedisClientType,
    private readonly client: HydratedDocument<IClient>
  ) {}

  public static async find(client_id: string) {
    const client = await Client.findOne({ id: client_id });
    if (!client) {
      throw new UnprocessableEntityException(
        "Invalid client id. If you think this is a mistake, please contact the administrator."
      );
    }
    return client;
  }

  public async validateRedirectUri(redirect_uri: string) {
    if (!this.client.redirect_uris.includes(redirect_uri)) {
      throw new UnprocessableEntityException(
        "Redirect URI not allowed. If you think this is a mistake, please contact the administrator."
      );
    }
  }

  public async validateScopes(scopes: ClientScope[]) {
    const valid = scopes.every((scope) => this.client.scopes.includes(scope));
    if (!valid) {
      throw new UnprocessableEntityException(
        "Invalid scopes. If you think this is a mistake, please contact the administrator."
      );
    }
  }

  public async requestAuthorization(
    redirect_uri: string,
    scopes: ClientScope[]
  ) {
    await new SessionService(
      this.request,
      this.reply,
      this.redisClient
    ).saveClient(this.client, redirect_uri, scopes);
  }

  public async finishAuthorization() {
    const user = this.request.session.get("user");
    const client = this.request.session.get("client");
    const redirect_uri = this.request.session.get("redirect_uri");
    const scopes = this.request.session.get("scopes");

    const url = redirect_uri;

    if (!user || !client || !redirect_uri) {
      throw new UnprocessableEntityException("Invalid session");
    }

    this.request.session.set("client", undefined);
    this.request.session.set("redirect_uri", undefined);
    this.request.session.set("social_user", undefined);
    this.request.session.set("social_type", undefined);
    this.request.session.set("two_factor_user", undefined);
    await this.request.session.set("scopes", undefined);

    const code = JWT.signCode({
      user_id: String(user._id),
      client_id: client.id,
      scopes: scopes as string[],
    });

    return this.reply.redirect(`${url}?code=${code}`);
  }
}

export default ClientService;
