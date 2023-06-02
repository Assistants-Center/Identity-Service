import path from "path";
import dotenv from "dotenv";
import { readFileSync } from "fs";

const config = dotenv.parse(readFileSync(path.join(__dirname, "../.env")));

export enum EnvironmentType {
  Development = "development",
  Production = "production",
  Beta = "beta",
}

export default class Environment {
  public static readonly type: EnvironmentType =
    config.NODE_ENV as EnvironmentType;
  public static readonly port: number = parseInt(config.PORT);

  public static readonly sessionSecret: string = config.SESSION_SECRET;

  public static readonly database: {
    host: string;
    username: string;
    password: string;
  } = {
    host: config.DATABASE_HOST,
    username: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
  };

  public static readonly discord: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  } = {
    client_id: config.DISCORD_CLIENT_ID,
    client_secret: config.DISCORD_CLIENT_SECRET,
    redirect_uri: config.DISCORD_REDIRECT_URI,
  };
}
