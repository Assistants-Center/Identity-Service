type AccountLogin_Plain_Request = {
  parameter: string;
  password: string;
};

type AccountCreate_Plain_Request = {
  username: string;
  email: string;
  password: string;
};

export { AccountLogin_Plain_Request, AccountCreate_Plain_Request };
