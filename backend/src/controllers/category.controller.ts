import { Request, Response } from "express";
import { Category, Blog } from "../models";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  const counts = await Blog.aggregate([{ $match: { status: "published" } }, { $group: { _id: "$category", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const withCounts = categories.map((c) => ({ ...c, postCount: countMap.get(String(c._id)) ?? 0 }));

  res.status(200).json(new ApiResponse(200, "Categories fetched", { categories: withCounts }));
});
