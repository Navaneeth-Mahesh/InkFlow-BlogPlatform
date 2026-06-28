import { Request, Response, CookieOptions } from "express";
import { User } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token";
import { env } from "../config/env";

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  path: "/api/v1/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function issueTokens(user: { _id: unknown; username: string; role: "user" | "admin" }) {
  const accessToken = generateAccessToken({ sub: String(user._id), username: user.username, role: user.role });
  const refreshToken = generateRefreshToken({ sub: String(user._id) });
  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === String(email).toLowerCase() ? "email" : "username";
    throw ApiError.conflict(`That ${field} is already taken`);
  }

  const user = await User.create({ name, username, email, password });
  const { accessToken, refreshToken } = issueTokens(user);

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json(new ApiResponse(201, "Account created", { user, accessToken }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Incorrect email or password");
  }

  const { accessToken, refreshToken } = issueTokens(user);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(200).json(new ApiResponse(200, "Signed in", { user: user.toJSON(), accessToken }));
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    path: "/api/v1/auth",
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
  } as CookieOptions);
  res.status(200).json(new ApiResponse(200, "Signed out", null));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized("No refresh token provided");

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized("User no longer exists");

  const { accessToken, refreshToken } = issueTokens(user);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, "Token refreshed", { accessToken }));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");
  res.status(200).json(new ApiResponse(200, "Current user", { user }));
});
