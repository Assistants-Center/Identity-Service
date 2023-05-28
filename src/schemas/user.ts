import { model, Schema } from "mongoose";

import { IUser } from "../types/user";

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  roles: { type: [String], required: true, default: [] },
});

const User = model<IUser>("User", userSchema);

export default User;
