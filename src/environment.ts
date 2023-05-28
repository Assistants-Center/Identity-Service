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

  public static readonly database: {
    host: string;
    username: string;
    password: string;
  } = {
    host: config.DATABASE_HOST,
    username: config.DATABASE_USERNAME,
    password: config.DATABASE_PASSWORD,
  };
}