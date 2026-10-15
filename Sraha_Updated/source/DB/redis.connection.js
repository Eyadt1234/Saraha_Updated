import { createClient } from "redis";
import { REDIS_URI } from "../config.js";

export const redisClient = createClient({
  url: REDIS_URI,
  socket: { reconnectStrategy: (retries) => Math.min(retries * 500, 5000) },
});

let lastLoggedError = "";
redisClient.on("error", (error) => {
  const message = error?.message || String(error);
  if (message !== lastLoggedError) {
    lastLoggedError = message;
    console.log("Redis error:", message);
  }
});
redisClient.on("ready", () => {
  lastLoggedError = "";
  console.log("Redis connected");
});

export const bootstrapRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log("Redis connection failed", error.message);
  }
};