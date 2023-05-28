enum ClientScope {
  ADMIN = "admin",

  ACCOUNT_READ = "account:read",
  ACCOUNT_WRITE = "account:write",
  ACCOUNT_DELETE = "account:delete",

  DBD_READ = "dbd:read",
  DBD_WRITE = "dbd:write",
  DBD_DELETE = "dbd:delete",

  STORE_READ = "store:read",
  STORE_WRITE = "store:write",
  STORE_DELETE = "store:delete",
}

interface IClient {
  id: string;
  secret: string;
  redirectUris: string[];
  name: string;

  scope: ClientScope[];
}

export { ClientScope, IClient };
