import express from "express";
import cors from "cors";
import { PORT } from "./config.js";
import { bootstrapDB } from "./DB/connection.db.js";
import { bootstrapRedis } from "./DB/redis.connection.js";
import "./DB/model/index.js";
import { userController, messageController } from "./modules/index.js";
import { globalErrorHandling } from "./middleware/index.js";

const app = express();
const port = PORT;

app.use(cors());
app.use(express.json());

app.all("/", (req, res) => res.status(200).send({ message: `Welcome to ${port}...🌸` }));

app.use("/users", userController);
app.use("/messages", messageController);

app.all("/{*dummy}", (req, res) => res.status(404).send({ message: "Invalid application route" }));

app.use(globalErrorHandling);

bootstrapRedis();
bootstrapDB(app, port);