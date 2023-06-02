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

class ClientService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
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

  public async requestAuthorization(redirect_uri: string) {
    await new SessionService(this.request, this.reply).saveClient(
      this.client,
      redirect_uri
    );
  }

  public async finishAuthorization() {
    const user = this.request.session.get("user");
    const client = this.request.session.get("client");
    const redirect_uri = this.request.session.get("redirect_uri");

    const url = redirect_uri;

    if (!user || !client || !redirect_uri) {
      throw new UnprocessableEntityException("Invalid session");
    }

    await this.request.session.set("client", null);
    await this.request.session.set("redirect_uri", null);

    const code = JWT.signCode({
      user_id: user.id,
      client_id: client.id,
      scopes: client.scopes,
    });

    return this.reply.redirect(`${url}?code=${code}`);
  }
}

export default ClientService;
