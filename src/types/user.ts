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
  email: string;
  password: string;
  two_factor: {
    enabled: boolean;
    devices: ITwoFactorDevice[];
  };
  roles: UserRole[];
}

export { IUser };
