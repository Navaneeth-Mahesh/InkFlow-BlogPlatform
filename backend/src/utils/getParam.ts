import { Request } from "express";
import { ApiError } from "./ApiError";

export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) throw ApiError.badRequest(`Unexpected repeated parameter: ${name}`);
  if (!value) throw ApiError.badRequest(`Missing required parameter: ${name}`);
  return value;
}
