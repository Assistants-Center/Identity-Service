import User from "../schemas/user";
import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";
import { UnprocessableEntityException } from "../utils/http_exceptions";
import { RedisClientType } from "redis";

class AccountService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>,
    private readonly redisClient: RedisClientType
  ) {}

  public async findByParameter(parameter: string) {
    const user = await User.findOne({
      $or: [{ username: parameter }, { email: parameter }],
    });
    if (!user) {
      throw new UnprocessableEntityException(
        "Account not found using this parameter"
      );
    }
    return user;
  }

  public async findByDiscordId(discord_id: string) {
    const user = await User.findOne({
      "connections.discord.id": discord_id,
    });

    return user;
  }

  public async create(query: any) {
    return await User.create(query);
  }
}

export default AccountService;
