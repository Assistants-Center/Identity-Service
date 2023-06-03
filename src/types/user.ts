enum UserRole {
  ADMIN = "admin",
}

interface ITwoFactorDevice {
  id: string;
  name: string;
  secret: string;
  verified: boolean;
}

interface IUser {
  username: string;
  email?: string;
  avatar: string;
  verified: boolean;
  allow_marketing: boolean;
  password: string;
  two_factor: {
    enabled: boolean;
    devices: ITwoFactorDevice[];
  };
  roles: UserRole[];

  connections: {
    discord: {
      id: string;
    };
    google: {
      id: string;
    };
    github: {
      id: string;
    };
  };
}

interface IUserResponse {
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

export { IUser, IUserResponse };
