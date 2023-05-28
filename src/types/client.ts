enum ClientScope {
  Admin = "admin",

  AccountRead = "account:read",
  AccountWrite = "account:write",
  AccountDelete = "account:delete",

  DbdRead = "dbd:read",
  DbdWrite = "dbd:write",
  DbdDelete = "dbd:delete",

  StoreRead = "store:read",
  StoreWrite = "store:write",
  StoreDelete = "store:delete",
}

interface IClient {
  id: string;
  secret: string;
  redirect_uris: string[];
  name: string;

  scope: ClientScope[];
}

export { ClientScope, IClient };
