import { Request, Response } from "express";
import { Blog, Bookmark } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination, buildMeta } from "../utils/pagination";
import { blogPopulateOptions } from "../services/blog.service";

export const saveBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  const existing = await Bookmark.findOne({ user: req.user!.id, blog: blog._id });
  if (existing) {
    res.status(200).json(new ApiResponse(200, "Already saved", { saved: true }));
    return;
  }

  await Bookmark.create({ user: req.user!.id, blog: blog._id });
  await Blog.updateOne({ _id: blog._id }, { $inc: { bookmarksCount: 1 } });

  res.status(201).json(new ApiResponse(201, "Blog saved", { saved: true }));
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  const result = await Bookmark.findOneAndDelete({ user: req.user!.id, blog: req.params.blogId });
  if (result) await Blog.updateOne({ _id: req.params.blogId }, { $inc: { bookmarksCount: -1 } });
  res.status(200).json(new ApiResponse(200, "Bookmark removed", { saved: false }));
});

export const toggleBookmark = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  const existing = await Bookmark.findOne({ user: req.user!.id, blog: blog._id });

  if (existing) {
    await existing.deleteOne();
    await Blog.updateOne({ _id: blog._id }, { $inc: { bookmarksCount: -1 } });
    res.status(200).json(new ApiResponse(200, "Bookmark removed", { saved: false }));
    return;
  }

  await Bookmark.create({ user: req.user!.id, blog: blog._id });
  await Blog.updateOne({ _id: blog._id }, { $inc: { bookmarksCount: 1 } });
  res.status(201).json(new ApiResponse(201, "Blog saved", { saved: true }));
});

export const getSavedBlogs = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);

  const [bookmarks, total] = await Promise.all([
    Bookmark.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate({ path: "blog", populate: blogPopulateOptions }),
    Bookmark.countDocuments({ user: req.user!.id }),
  ]);

  const blogs = bookmarks.map((b) => b.blog).filter(Boolean);

  res.status(200).json(new ApiResponse(200, "Saved blogs fetched", { blogs }, buildMeta(total, pagination)));
});
