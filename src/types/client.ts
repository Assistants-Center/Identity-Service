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
  name: string;

  redirect_uris: string[];
  cancel_uri: string;

  user_consent_required: boolean;

  scopes: ClientScope[];
}

export { ClientScope, IClient };
