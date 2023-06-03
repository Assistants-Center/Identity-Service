import IdentityServer from "./server";

import connectDB from "./db";
import redisClient from "./redis";
import { RedisClientType } from "redis";

(async () => {
  await connectDB();
  console.log("Connected to DB");

  await redisClient.connect();
  console.log("Connected to Redis");

  const server = new IdentityServer(redisClient as RedisClientType);
  await server.start();
  console.log("Server started");
})();
