import { Request, Response } from "express";
import { Blog, Bookmark } from "../models";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { generateUniqueSlug } from "../utils/slug";
import { estimateReadTime } from "../utils/readTime";
import { getPagination, buildMeta } from "../utils/pagination";
import { getParam } from "../utils/getParam";
import { findOrCreateCategory } from "../services/category.service";
import { listBlogs, getTrendingBlogs, getRelatedBlogs, incrementViews, blogPopulateOptions, BlogSort } from "../services/blog.service";

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, tags, coverImage, status } = req.body;

  // Users can type any category name — it's created on first use rather
  // than restricted to a pre-seeded list.
  const categoryDoc = await findOrCreateCategory(category);

  const slug = await generateUniqueSlug(Blog, title);
  const readTime = estimateReadTime(content);
  const isPublished = (status ?? "published") === "published";

  const blog = await Blog.create({
    title,
    slug,
    content,
    excerpt: excerpt || content.replace(/<[^>]*>/g, " ").trim().slice(0, 180),
    category: categoryDoc._id,
    tags: tags ?? [],
    coverImage: coverImage ?? "",
    author: req.user!.id,
    status: isPublished ? "published" : "draft",
    readTime,
    publishedAt: isPublished ? new Date() : null,
  });

  const populated = await blog.populate(blogPopulateOptions);
  res.status(201).json(new ApiResponse(201, "Blog created", { blog: populated }));
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound("Blog not found");

  if (String(blog.author) !== req.user!.id && req.user!.role !== "admin") {
    throw ApiError.forbidden("You can only edit your own blogs");
  }

  const { title, content, excerpt, category, tags, coverImage, status } = req.body;

  if (category) {
    const categoryDoc = await findOrCreateCategory(category);
    blog.category = categoryDoc._id;
  }

  if (title && title !== blog.title) {
    blog.title = title;
    blog.slug = await generateUniqueSlug(Blog, title, String(blog._id));
  }
  if (content) {
    blog.content = content;
    blog.readTime = estimateReadTime(content);
  }
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (tags !== undefined) blog.tags = tags;
  if (coverImage !== undefined) blog.coverImage = coverImage;

  if (status && status !== blog.status) {
    blog.status = status;
    if (status === "published" && !blog.publishedAt) blog.publishedAt = new Date();
  }

  await blog.save();
  const populated = await blog.populate(blogPopulateOptions);
  res.status(200).json(new ApiResponse(200, "Blog updated", { blog: populated }));
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound("Blog not found");

  if (String(blog.author) !== req.user!.id && req.user!.role !== "admin") {
    throw ApiError.forbidden("You can only delete your own blogs");
  }

  await Promise.all([blog.deleteOne(), Bookmark.deleteMany({ blog: blog._id })]);

  res.status(200).json(new ApiResponse(200, "Blog deleted", null));
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate(blogPopulateOptions);
  if (!blog) throw ApiError.notFound("Blog not found");

  const isOwner = req.user && String((blog.author as { _id?: unknown })._id ?? blog.author) === req.user.id;
  if (blog.status === "draft" && !isOwner && req.user?.role !== "admin") {
    throw ApiError.notFound("Blog not found");
  }

  if (blog.status === "published") void incrementViews(blog._id);

  res.status(200).json(new ApiResponse(200, "Blog fetched", { blog }));
});

export const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const sort = (req.query.sort as BlogSort) ?? "latest";

  const { items, total } = await listBlogs(
    {
      category: req.query.category as string | undefined,
      tag: req.query.tag as string | undefined,
      author: req.query.author as string | undefined,
      search: req.query.q as string | undefined,
    },
    sort,
    pagination
  );

  res.status(200).json(new ApiResponse(200, "Blogs fetched", { blogs: items }, buildMeta(total, pagination)));
});

export const getTrending = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(20, Number(req.query.limit ?? 6));
  const blogs = await getTrendingBlogs(limit);
  res.status(200).json(new ApiResponse(200, "Trending blogs fetched", { blogs }));
});

export const getRelated = asyncHandler(async (req: Request, res: Response) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw ApiError.notFound("Blog not found");
  const limit = Math.min(10, Number(req.query.limit ?? 3));
  const related = await getRelatedBlogs(blog, limit);
  res.status(200).json(new ApiResponse(200, "Related blogs fetched", { blogs: related }));
});

export const getMyBlogs = asyncHandler(async (req: Request, res: Response) => {
  const pagination = getPagination(req);
  const status = (req.query.status as "published" | "draft" | undefined) ?? undefined;

  const query: Record<string, unknown> = { author: req.user!.id };
  if (status) query.status = status;

  const [items, total] = await Promise.all([
    Blog.find(query).sort({ updatedAt: -1 }).skip(pagination.skip).limit(pagination.limit).populate(blogPopulateOptions).lean({ virtuals: true }),
    Blog.countDocuments(query),
  ]);

  res.status(200).json(new ApiResponse(200, "Your blogs fetched", { blogs: items }, buildMeta(total, pagination)));
});
