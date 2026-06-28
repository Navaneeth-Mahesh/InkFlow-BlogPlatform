import { Request, Response } from "express";
import { Blog } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const likeBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  const userId = req.user!.id;
  const alreadyLiked = blog.likes.some((id) => String(id) === userId);
  if (!alreadyLiked) {
    blog.likes.push(userId as never);
    await blog.save();
  }

  res.status(200).json(new ApiResponse(200, alreadyLiked ? "Already liked" : "Blog liked", { liked: true, likesCount: blog.likes.length }));
});

export const unlikeBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  const userId = req.user!.id;
  blog.likes = blog.likes.filter((id) => String(id) !== userId) as never;
  await blog.save();

  res.status(200).json(new ApiResponse(200, "Blog unliked", { liked: false, likesCount: blog.likes.length }));
});

export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  const userId = req.user!.id;
  const alreadyLiked = blog.likes.some((id) => String(id) === userId);

  if (alreadyLiked) blog.likes = blog.likes.filter((id) => String(id) !== userId) as never;
  else blog.likes.push(userId as never);

  await blog.save();

  res.status(200).json(new ApiResponse(200, alreadyLiked ? "Blog unliked" : "Blog liked", { liked: !alreadyLiked, likesCount: blog.likes.length }));
});
