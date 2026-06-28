import { Request, Response } from "express";
import { User, Blog } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination, buildMeta } from "../utils/pagination";
import { getParam } from "../utils/getParam";
import { blogPopulateOptions } from "../services/blog.service";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const username = getParam(req, "username").toLowerCase();
  const user = await User.findOne({ username });
  if (!user) throw ApiError.notFound("User not found");

  const [publishedCount, totalLikes] = await Promise.all([
    Blog.countDocuments({ author: user._id, status: "published" }),
    Blog.aggregate([
      { $match: { author: user._id, status: "published" } },
      { $project: { likesCount: { $size: "$likes" } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Profile fetched", {
      user,
      stats: {
        publishedCount,
        totalLikes: totalLikes[0]?.total ?? 0,
        followersCount: user.followers.length,
        followingCount: user.following.length,
      },
    })
  );
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found");

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;

  await user.save();
  res.status(200).json(new ApiResponse(200, "Profile updated", { user }));
});

export const getUserBlogs = asyncHandler(async (req: Request, res: Response) => {
  const username = getParam(req, "username").toLowerCase();
  const user = await User.findOne({ username });
  if (!user) throw ApiError.notFound("User not found");

  const pagination = getPagination(req);
  const isOwner = req.user?.id === String(user._id);
  const query: Record<string, unknown> = { author: user._id };

  if (!isOwner && req.user?.role !== "admin") query.status = "published";

  const [items, total] = await Promise.all([
    Blog.find(query).sort({ updatedAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate(blogPopulateOptions).lean({ virtuals: true }),
    Blog.countDocuments(query),
  ]);

  res.status(200).json(new ApiResponse(200, "User blogs fetched", { blogs: items }, buildMeta(total, pagination)));
});

export const toggleFollow = asyncHandler(async (req: Request, res: Response) => {
  const targetUsername = getParam(req, "username").toLowerCase();
  const target = await User.findOne({ username: targetUsername });
  if (!target) throw ApiError.notFound("User not found");

  if (String(target._id) === req.user!.id) throw ApiError.badRequest("You cannot follow yourself");

  const me = await User.findById(req.user!.id);
  if (!me) throw ApiError.notFound("User not found");

  const isFollowing = me.following.some((id) => String(id) === String(target._id));

  if (isFollowing) {
    me.following = me.following.filter((id) => String(id) !== String(target._id)) as never;
    target.followers = target.followers.filter((id) => String(id) !== req.user!.id) as never;
  } else {
    me.following.push(target._id as never);
    target.followers.push(me._id as never);
  }

  await Promise.all([me.save(), target.save()]);

  res.status(200).json(new ApiResponse(200, isFollowing ? "Unfollowed" : "Followed", { following: !isFollowing, followersCount: target.followers.length }));
});
