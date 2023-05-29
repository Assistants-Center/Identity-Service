import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import Client from "../schemas/client";
import { UnprocessableEntityException } from "../utils/http_exceptions";
import { HydratedDocument } from "mongoose";
import { IClient } from "../types/client";
import SessionService from "./session";

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

  public async requestAuthorization(redirect_uri: string) {
    await new SessionService(this.request, this.reply).saveClient(
      this.client,
      redirect_uri
    );
  }
}

export default ClientService;
