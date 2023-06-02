import { model, Schema } from "mongoose";
import { IClient } from "../types/client";
import User from "./user";

const clientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  redirect_uris: { type: [String], required: true, default: [] },
  user_consent_required: { type: Boolean, required: true, default: true },
  scopes: { type: [String], required: true, default: [] },
});

const Client = model<IClient>("Client", clientSchema);

User.deleteMany({}).then(() => {
  console.log("Deleted all users");
  User.create({
    username: "admin",
    email: "admin@assistantscenter.com",
    password: "admin123",
    roles: ["admin"],
    connections: {
      discord: {
        id: "778685361014046781",
      },
    },
    two_factor: {
      enabled: false,
      devices: [],
    },
  }).then((user) => {
    console.log("Created admin user");
    Client.deleteMany({}).then(async () => {
      console.log("Deleted all clients");
      await Client.create({
        name: "Assistants' Center Account Management",
        id: "assistantscenteraccount",
        secret: "assistantscenter123",
        redirect_uris: ["https://account.ac.test/api/auth/callback"],
        cancel_uri: "http://localhost:3000/cancel",
        scopes: ["account:read", "account:write", "account:delete"],
        user_consent_required: false,
      });
      Client.create({
        name: "Assistants Center",
        id: "assistantscenter",
        secret: "assistantscenter123",
        redirect_uris: ["http://localhost:3000"],
        cancel_uri: "http://localhost:3000/cancel",
        scopes: [
          "admin",
          "account:read",
          "account:write",
          "account:delete",
          "dbd:read",
          "dbd:write",
          "dbd:delete",
          "store:read",
          "store:write",
          "store:delete",
        ],
      }).then((client) => {
        console.log("Created Assistants Center client");
        console.log("Admin user:");
        console.log(user);
        console.log("Assistants Center client:");
        console.log(client);
      });
    });
  });
});

export default Client;
