import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadImageBuffer } from "../services/upload.service";

export const uploadCoverImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    const validationError = (req as { fileValidationError?: string }).fileValidationError;
    throw ApiError.badRequest(validationError ?? "No image file provided");
  }
  const result = await uploadImageBuffer(req.file.buffer, req.file.mimetype, "inkflow/covers");
  res.status(201).json(new ApiResponse(201, "Image uploaded", result));
});
