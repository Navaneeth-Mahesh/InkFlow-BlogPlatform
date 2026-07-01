import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

function fromMulterError(err: multer.MulterError): ApiError {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return ApiError.badRequest("That image is larger than the 5MB limit. Please choose a smaller file.");
    case "LIMIT_UNEXPECTED_FILE":
      return ApiError.badRequest("Unexpected file field. Please upload a single image.");
    case "LIMIT_FILE_COUNT":
      return ApiError.badRequest("Only one image can be uploaded at a time.");
    default:
      return ApiError.badRequest(`Upload failed: ${err.message}`);
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof multer.MulterError) {
    apiError = fromMulterError(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ message: e.message }));
    apiError = ApiError.badRequest("Validation failed", errors);
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = ApiError.badRequest(`Invalid value for field "${err.path}"`);
  } else if ((err as { code?: number })?.code === 11000) {
    const mongoErr = err as { keyValue?: Record<string, unknown> };
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : "field";
    apiError = ApiError.conflict(`${field} already exists`);
  } else if ((err as { name?: string })?.name === "JsonWebTokenError") {
    apiError = ApiError.unauthorized("Invalid token");
  } else if ((err as { name?: string })?.name === "TokenExpiredError") {
    apiError = ApiError.unauthorized("Token expired");
  } else {
    apiError = ApiError.internal(err instanceof Error ? err.message : "Something went wrong");
  }

  if (!apiError.isOperational || apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${apiError.statusCode} ${apiError.message}`, {
      stack: err instanceof Error ? err.stack : undefined,
    });
  } else {
    logger.debug(`${req.method} ${req.originalUrl} → ${apiError.statusCode} ${apiError.message}`);
  }

  res.status(apiError.statusCode).json({
    success: false,
    statusCode: apiError.statusCode,
    message: apiError.message,
    errors: apiError.errors.length ? apiError.errors : undefined,
    stack: env.isProduction ? undefined : apiError.stack,
  });
}
