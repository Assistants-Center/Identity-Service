import { model, Schema } from "mongoose";
import { IClient } from "../types/client";

const clientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  redirect_uris: { type: [String], required: true, default: [] },
  user_consent_required: { type: Boolean, required: true, default: true },
  scopes: { type: [String], required: true, default: [] },
});

const Client = model<IClient>("Client", clientSchema);

export default Client;
