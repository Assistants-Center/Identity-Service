import { Length, Validate } from "class-validator";

import {
  EmailValidator,
  ParameterValidator,
  UsernameValidator,
} from "../utils/validators";

type AccountLogin_Plain_Request = {
  parameter: string;
  password: string;
};

class AccountLogin_Plain_Request_DTO implements AccountLogin_Plain_Request {
  @Length(5, 255)
  @Validate(ParameterValidator)
  parameter: string;

  @Length(6, 255)
  password: string;

  constructor(body: AccountLogin_Plain_Request) {
    this.parameter = body.parameter;
    this.password = body.password;
  }
}

type AccountCreate_Plain_Request = {
  username: string;
  email: string;
  password: string;
};

class AccountCreate_Plain_Request_DTO implements AccountCreate_Plain_Request {
  @Length(1, 255)
  @Validate(UsernameValidator)
  username: string;

  @Length(5, 255)
  @Validate(EmailValidator)
  email: string;

  @Length(6, 255)
  password: string;

  constructor(body: AccountCreate_Plain_Request) {
    this.username = body.username;
    this.email = body.email;
    this.password = body.password;
  }
}

type TwoFactorVerify_Request = {
  code: string;
};

class TwoFactorVerify_Request_DTO implements TwoFactorVerify_Request {
  @Length(6, 6)
  code: string;

  constructor(body: TwoFactorVerify_Request) {
    this.code = body.code;
  }
}

type DiscordCallback_Request = {
  code: string;
  error?: string;
};

class DiscordCallback_Request_DTO implements DiscordCallback_Request {
  @Length(1, 255)
  code: string;

  error?: string;

  constructor(body: DiscordCallback_Request) {
    this.code = body.code;
    this.error = body.error;
  }
}

type RegisterSocial_Request = {
  username: string;
  email: string;
};

class RegisterSocial_Request_DTO implements RegisterSocial_Request {
  @Length(1, 255)
  @Validate(UsernameValidator)
  username: string;

  @Length(5, 255)
  @Validate(EmailValidator)
  email: string;

  constructor(body: RegisterSocial_Request) {
    this.username = body.username;
    this.email = body.email;
  }
}

type Authorize_Request = {
  client_id: string;
  redirect_uri: string;
  scope: string;
};

class Authorize_Request_DTO implements Authorize_Request {
  @Length(1, 255)
  client_id: string;

  @Length(5, 255)
  redirect_uri: string;

  @Length(1, 1000)
  scope: string;

  constructor(body: Authorize_Request) {
    this.client_id = body.client_id;
    this.redirect_uri = body.redirect_uri;
    this.scope = body.scope;
  }
}

export {
  AccountLogin_Plain_Request,
  AccountLogin_Plain_Request_DTO,
  AccountCreate_Plain_Request,
  AccountCreate_Plain_Request_DTO,
  TwoFactorVerify_Request,
  TwoFactorVerify_Request_DTO,
  DiscordCallback_Request,
  DiscordCallback_Request_DTO,
  RegisterSocial_Request,
  RegisterSocial_Request_DTO,
  Authorize_Request,
  Authorize_Request_DTO,
};
