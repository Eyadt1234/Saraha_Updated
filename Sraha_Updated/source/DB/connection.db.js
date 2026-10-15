import mongoose from "mongoose";
import { DB_NAME, DB_URI } from "../config.js";
import { UserModel } from "./model/index.js";

export const bootstrapDB = async (app, port) => {
  try {
    await mongoose.connect(DB_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });
    await UserModel.syncIndexes();

    console.log("Db connected");

    app.listen(port, () => console.log(`Running on : ${port}...🌸`));
  } catch (error) {
    console.log("Connection Failed", error);
  }
};