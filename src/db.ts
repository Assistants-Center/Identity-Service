import Environment from "./environment";
import * as mongoose from "mongoose";

const connectDB = async () => {
  console.log("Connecting to Identity's MongoDB");

  await mongoose
    .connect(
      Environment.database.host
        .replace("<username>", Environment.database.username)
        .replace("<password>", Environment.database.password)
    )
    .catch((err) => {
      console.log(err);
    });

  console.log("Connected to MongoDB");
};

export default connectDB;
