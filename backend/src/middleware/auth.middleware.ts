import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, AccessTokenPayload } from "../utils/token";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload & { id: string };
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }

  const userExists = await User.exists({ _id: payload.sub });
  if (!userExists) throw ApiError.unauthorized("User no longer exists");

  req.user = { ...payload, id: payload.sub };
  next();
});

export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const userExists = await User.exists({ _id: payload.sub });
    if (userExists) req.user = { ...payload, id: payload.sub };
  } catch {
    // invalid token on an optional route just means "anonymous"
  }
  next();
});

export function requireRole(...roles: Array<"user" | "admin">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized("Authentication required");
    if (!roles.includes(req.user.role)) throw ApiError.forbidden("You do not have permission to perform this action");
    next();
  };
}
