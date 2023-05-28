import IdentityServer from "./server";
import connectDB from "./db";

const server = new IdentityServer();

connectDB().then(async () => {
  await server.start();
});
