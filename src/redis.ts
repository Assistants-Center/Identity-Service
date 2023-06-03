import { createClient } from "redis";
import Environment from "./environment";

const redisClient = createClient({
  url: `${Environment.redis.host}:${Environment.redis.port}`,
});

export default redisClient;
