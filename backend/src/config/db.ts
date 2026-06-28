import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

mongoose.set("strictQuery", true);

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on("connected", () => logger.info(`MongoDB connected → ${mongoose.connection.name}`));
    mongoose.connection.on("error", (err) => logger.error(`MongoDB connection error: ${err.message}`));
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));

    await mongoose.connect(env.MONGODB_URI, { maxPoolSize: 10 });
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${(err as Error).message}`);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
