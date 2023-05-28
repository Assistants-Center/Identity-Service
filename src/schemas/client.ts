import { model, Schema } from "mongoose";
import { ClientScope, IClient } from "../types/client";

const clientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  redirectUris: { type: [String], required: true, default: [] },
  scope: { type: [ClientScope], required: true, default: [] },
});

const Client = model<IClient>("Client", clientSchema);

export default Client;
