import { model, Schema } from "mongoose";

import { IUser } from "../types/user";

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, sparse: true, default: null },
  avatar: { type: String, sparse: true, default: null },
  verified: { type: Boolean, required: true, default: false },
  allow_marketing: { type: Boolean, required: true, default: false },
  password: {
    type: String,
    sparse: true,
    default: null,
  },
  connections: {
    discord: {
      id: { type: String, sparse: true, default: null },
    },
  },
  two_factor: {
    enabled: { type: Boolean, required: true, default: false },
    devices: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          secret: { type: String, required: true },
          verified: { type: Boolean, required: true, default: false },
        },
      ],
    },
  },
  roles: { type: [String], required: true, default: [] },
});

const User = model<IUser>("User", userSchema);

export default User;
