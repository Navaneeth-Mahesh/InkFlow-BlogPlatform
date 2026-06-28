import { Request, Response } from "express";
import { Blog, Comment, IComment } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getPagination, buildMeta } from "../utils/pagination";
import { getParam } from "../utils/getParam";

const AUTHOR_POPULATE = { path: "user", select: "name username" };

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const blogId = getParam(req, "blogId");
  const { content, parentComment } = req.body as { content: string; parentComment?: string };

  const blog = await Blog.findById(blogId);
  if (!blog) throw ApiError.notFound("Blog not found");

  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent || String(parent.blog) !== blogId) throw ApiError.badRequest("Invalid parent comment");
  }

  const comment: IComment = await Comment.create({ blog: blogId, user: req.user!.id, content, parentComment: parentComment ?? null });

  await Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } });
  await comment.populate(AUTHOR_POPULATE);

  res.status(201).json(new ApiResponse(201, "Comment added", { comment }));
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  if (String(comment.user) !== req.user!.id) throw ApiError.forbidden("You can only edit your own comments");

  comment.content = req.body.content;
  await comment.save();
  await comment.populate(AUTHOR_POPULATE);

  res.status(200).json(new ApiResponse(200, "Comment updated", { comment }));
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  if (String(comment.user) !== req.user!.id && req.user!.role !== "admin") {
    throw ApiError.forbidden("You can only delete your own comments");
  }

  const replies = await Comment.find({ parentComment: comment._id });
  const removedCount = 1 + replies.length;

  await Comment.deleteMany({ _id: { $in: [comment._id, ...replies.map((r) => r._id)] } });
  await Blog.updateOne({ _id: comment.blog }, { $inc: { commentsCount: -removedCount } });

  res.status(200).json(new ApiResponse(200, "Comment deleted", null));
});

export const getBlogComments = asyncHandler(async (req: Request, res: Response) => {
  const blogId = getParam(req, "blogId");
  const pagination = getPagination(req, 20, 100);

  const blogExists = await Blog.exists({ _id: blogId });
  if (!blogExists) throw ApiError.notFound("Blog not found");

  const topLevelQuery = { blog: blogId, parentComment: null };

  const [topLevel, total] = await Promise.all([
    Comment.find(topLevelQuery).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate(AUTHOR_POPULATE).lean(),
    Comment.countDocuments(topLevelQuery),
  ]);

  const topLevelIds = topLevel.map((c) => c._id);
  const replies = await Comment.find({ parentComment: { $in: topLevelIds } }).sort({ createdAt: 1 }).populate(AUTHOR_POPULATE).lean();

  const repliesByParent = new Map<string, typeof replies>();
  for (const reply of replies) {
    const key = String(reply.parentComment);
    if (!repliesByParent.has(key)) repliesByParent.set(key, []);
    repliesByParent.get(key)!.push(reply);
  }

  const withReplies = topLevel.map((comment) => ({ ...comment, replies: repliesByParent.get(String(comment._id)) ?? [] }));

  res.status(200).json(new ApiResponse(200, "Comments fetched", { comments: withReplies }, buildMeta(total, pagination)));
});
