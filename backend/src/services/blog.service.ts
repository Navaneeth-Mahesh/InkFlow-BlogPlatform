import { Types } from "mongoose";
import { Blog, Category, IBlog } from "../models";
import { PaginationParams } from "../utils/pagination";

export interface BlogListFilters {
  category?: string;
  tag?: string;
  author?: string;
  status?: "published" | "draft";
  search?: string;
}

export type BlogSort = "latest" | "popular" | "discussed" | "trending";

const AUTHOR_POPULATE = { path: "author", select: "name username bio role followers" };
const CATEGORY_POPULATE = { path: "category", select: "name slug color" };

async function resolveCategoryFilter(category: string): Promise<Types.ObjectId | string | null> {
  // The frontend filters by category slug, but Blog.category stores an
  // ObjectId — resolve slug -> id here so filtering actually matches.
  // Falls back to treating the value as a raw id for API callers that
  // already have one.
  if (Types.ObjectId.isValid(category)) return category;
  const doc = await Category.findOne({ slug: category }).select("_id");
  return doc?._id ?? null;
}

async function buildFilterQuery(filters: BlogListFilters) {
  const query: Record<string, unknown> = {};
  query.status = filters.status ?? "published";

  if (filters.category) {
    const categoryId = await resolveCategoryFilter(filters.category);
    if (!categoryId) {
      // Unknown category slug/id — return a query that matches nothing
      // rather than silently ignoring the filter.
      query._id = { $in: [] };
    } else {
      query.category = categoryId;
    }
  }

  if (filters.author) query.author = filters.author;
  if (filters.tag) query.tags = filters.tag.toLowerCase();
  if (filters.search) query.$text = { $search: filters.search };
  return query;
}

export async function listBlogs(filters: BlogListFilters, sort: BlogSort, { skip, limit }: PaginationParams) {
  const query = await buildFilterQuery(filters);
  const hasTextSearch = Boolean(filters.search);

  const sortSpec = hasTextSearch
    ? { score: { $meta: "textScore" } }
    : sort === "popular"
    ? { likes: -1, publishedAt: -1 }
    : sort === "discussed"
    ? { commentsCount: -1, publishedAt: -1 }
    : sort === "trending"
    ? { views: -1, publishedAt: -1 }
    : { publishedAt: -1 };

  const [items, total] = await Promise.all([
    Blog.find(query)
      .select(hasTextSearch ? { score: { $meta: "textScore" } } : {})
      .sort(sortSpec as never)
      .skip(skip)
      .limit(limit)
      .populate(AUTHOR_POPULATE)
      .populate(CATEGORY_POPULATE)
      .lean({ virtuals: true }),
    Blog.countDocuments(query),
  ]);

  return { items, total };
}

export async function getTrendingBlogs(limit = 6) {
  return Blog.find({ status: "published" })
    .sort({ views: -1, publishedAt: -1 })
    .limit(limit)
    .populate(AUTHOR_POPULATE)
    .populate(CATEGORY_POPULATE)
    .lean({ virtuals: true });
}

export async function getRelatedBlogs(blog: IBlog, limit = 3) {
  const sameCategory = await Blog.find({ _id: { $ne: blog._id }, category: blog.category, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate(AUTHOR_POPULATE)
    .populate(CATEGORY_POPULATE)
    .lean({ virtuals: true });

  if (sameCategory.length >= limit) return sameCategory;

  const fillerNeeded = limit - sameCategory.length;
  const excludeIds = [blog._id, ...sameCategory.map((b) => b._id)];
  const filler = await Blog.find({ _id: { $nin: excludeIds }, status: "published" })
    .sort({ publishedAt: -1 })
    .limit(fillerNeeded)
    .populate(AUTHOR_POPULATE)
    .populate(CATEGORY_POPULATE)
    .lean({ virtuals: true });

  return [...sameCategory, ...filler];
}

export async function incrementViews(blogId: string | Types.ObjectId) {
  await Blog.updateOne({ _id: blogId }, { $inc: { views: 1 } });
}

export const blogPopulateOptions = [AUTHOR_POPULATE, CATEGORY_POPULATE];
