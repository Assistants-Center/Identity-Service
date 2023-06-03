import { Length } from "class-validator";

interface IJwtPayload {
  exp?: number;
  user_id: string;
  client_id: string;
  scopes: string[];
}

export type AccessToken_Request = {
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
};

export class AccessToken_Request_DTO implements AccessToken_Request {
  @Length(1, 10000)
  code: string;

  @Length(5, 255)
  redirect_uri: string;

  @Length(6, 255)
  client_id: string;

  @Length(6, 255)
  client_secret: string;

  constructor(body: AccessToken_Request) {
    this.code = body.code;
    this.redirect_uri = body.redirect_uri;
    this.client_id = body.client_id;
    this.client_secret = body.client_secret;
  }
}

export { IJwtPayload };
