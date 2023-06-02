import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { IJwtPayload } from "../types/jwt";

declare module "jsonwebtoken" {
  export function sign(
    payload: IJwtPayload,
    secretOrPrivateKey: jwt.Secret,
    options?: jwt.SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: jwt.Secret,
    options?: jwt.VerifyOptions
  ): IJwtPayload;
}

const codeKeys = [
  fs.readFileSync(path.join(__dirname, "../../keys/code/private.key")),
  fs.readFileSync(path.join(__dirname, "../../keys/code/public.pem")),
];

const accessTokenKeys = [
  fs.readFileSync(path.join(__dirname, "../../keys/access_token/private.key")),
  fs.readFileSync(path.join(__dirname, "../../keys/access_token/public.pem")),
];

class JWT {
  static signCode(payload: IJwtPayload) {
    return jwt.sign(payload, codeKeys[0], {
      algorithm: "RS256",
      expiresIn: "5m",
    });
  }

  static verifyCode(token: string) {
    return jwt.verify(token, codeKeys[1]);
  }

  static signAccessToken(payload: IJwtPayload) {
    return jwt.sign(payload, accessTokenKeys[0], {
      algorithm: "RS256",
      expiresIn: "1w",
    });
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, accessTokenKeys[1]);
  }
}

export default JWT;
