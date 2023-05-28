enum UserRole {
  ADMIN = "admin",
}

interface IUser {
  name: string;
  email: string;
  roles: UserRole[];
}

export { IUser };
