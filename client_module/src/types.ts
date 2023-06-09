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

interface IdentityClientOptions {
  rejectUnauthorized?: boolean;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: ClientScope[];

  identityUrl?: string;
}

enum UserRole {
  ADMIN = "admin",
}

interface UserResponse {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
  verified: boolean;
  allow_marketing: boolean;
  roles: UserRole[];

  connections: {
    discord: {
      id?: string;
    };
    google: {
      id?: string;
    };
    github: {
      id?: string;
    };
  };
}

export { UserRole, UserResponse, ClientScope, IdentityClientOptions };
