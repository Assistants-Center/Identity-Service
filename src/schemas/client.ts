import { model, Schema } from "mongoose";
import { IClient } from "../types/client";
import User from "./user";

const clientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  redirect_uris: { type: [String], required: true, default: [] },
  scope: { type: [String], required: true, default: [] },
});

const Client = model<IClient>("Client", clientSchema);

User.deleteMany({}).then(() => {
  console.log("Deleted all users");
  User.create({
    username: "admin",
    email: "admin@assistantscenter.com",
    password: "admin123",
    roles: ["admin"],
  }).then((user) => {
    console.log("Created admin user");
    Client.deleteMany({}).then(() => {
      console.log("Deleted all clients");
      Client.create({
        name: "Assistants Center",
        id: "assistantscenter",
        secret: "assistantscenter123",
        redirect_uris: ["http://localhost:3000"],
        scope: [
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
