import { Request, Response } from "express";
import { Blog, User } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination, buildMeta } from "../utils/pagination";
import { blogPopulateOptions } from "../services/blog.service";

export const searchAll = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const scope = (req.query.scope as "blogs" | "authors" | undefined) ?? "blogs";
  const pagination = getPagination(req);

  if (scope === "authors") {
    const filter = q ? { $or: [{ name: new RegExp(q, "i") }, { username: new RegExp(q, "i") }] } : {};
    const [items, total] = await Promise.all([
      User.find(filter).skip(pagination.skip).limit(pagination.limit).lean(),
      User.countDocuments(filter),
    ]);
    res.status(200).json(new ApiResponse(200, "Authors fetched", { authors: items }, buildMeta(total, pagination)));
    return;
  }

  const filter: Record<string, unknown> = { status: "published" };
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Blog.find(filter)
      .sort(q ? { score: { $meta: "textScore" } } : { publishedAt: -1 })
      .select(q ? { score: { $meta: "textScore" } } : {})
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate(blogPopulateOptions)
      .lean({ virtuals: true }),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json(new ApiResponse(200, "Blogs fetched", { blogs: items }, buildMeta(total, pagination)));
});
