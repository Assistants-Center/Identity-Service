import Environment from "./environment";
import * as mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(
    Environment.database.host
      .replace("<username>", Environment.database.username)
      .replace("<password>", Environment.database.password)
  );
};

export default connectDB;
