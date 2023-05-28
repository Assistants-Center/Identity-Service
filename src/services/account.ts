import User from "../schemas/user";
import {
  FastifyReply,
  FastifyRequest,
  RawServerBase,
  RouteGenericInterface,
} from "fastify";

class AccountService<
  Request extends RouteGenericInterface,
  Reply extends RawServerBase
> {
  constructor(
    private readonly request: FastifyRequest<Request>,
    private readonly reply: FastifyReply<Reply>
  ) {}

  public async findByParameter(parameter: string) {
    const user = await User.findOne({
      $or: [{ username: parameter }, { email: parameter }],
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  public async create(username: string, email: string, password: string) {
    const user = await User.create({
      username,
      email,
      password,
    });
    return user;
  }
}

export default AccountService;
