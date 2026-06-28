import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { generalLimiter } from "./middleware/rateLimiter.middleware";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware";
import { ApiResponse } from "./utils/ApiResponse";
import apiRoutes from "./routes";
import { setupSwagger } from "./docs/swagger";

export function createApp(): Express {
  const app = express();
  app.set("trust proxy", 1);
  
  app.use(helmet());
  app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use((req, _res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body);
    if (req.params) req.params = mongoSanitize.sanitize(req.params);
    next();
  });

  app.use(compression());

  if (!env.isProduction) {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined", { stream: { write: (message: string) => logger.info(message.trim()) } }));
  }

  app.use("/api", generalLimiter);

if (!env.isProduction) {
  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"))
  );
}

  app.get("/health", (_req, res) => {
    res.status(200).json(new ApiResponse(200, "InkFlow API is running", { uptime: process.uptime() }));
  });

  setupSwagger(app);

  app.use("/api/v1", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
