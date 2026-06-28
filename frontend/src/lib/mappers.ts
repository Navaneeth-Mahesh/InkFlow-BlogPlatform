import { Author, Category, Post, Comment } from "@/types";
import { RawUser, RawCategory, RawBlog, RawComment } from "@/types/api";

export function mapAuthor(raw: RawUser, currentUserId?: string): Author {
  return {
    id: raw._id,
    username: raw.username,
    name: raw.name,
    bio: raw.bio ?? "",
    role: raw.role === "admin" ? "Admin" : "Writer",
    followers: raw.followers?.length ?? 0,
    following: raw.following?.length ?? 0,
    postsCount: 0,
    joinedAt: raw.createdAt,
    isFollowing: currentUserId ? raw.followers?.includes(currentUserId) : undefined,
  };
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: raw._id,
    name: raw.name,
    slug: raw.slug,
    color: raw.color,
    postCount: raw.postCount ?? 0,
    description: raw.description,
  };
}

export function mapBlog(raw: RawBlog, currentUserId?: string): Post {
  return {
    id: raw._id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    content: raw.content,
    coverImage: raw.coverImage,
    author: mapAuthor(raw.author, currentUserId),
    category: mapCategory(raw.category),
    tags: raw.tags ?? [],
    readTime: raw.readTime,
    publishedAt: raw.publishedAt ?? raw.createdAt,
    updatedAt: raw.updatedAt,
    likes: raw.likesCount ?? raw.likes?.length ?? 0,
    comments: raw.commentsCount ?? 0,
    bookmarks: raw.bookmarksCount ?? 0,
    views: raw.views ?? 0,
    isLiked: currentUserId ? raw.likes?.includes(currentUserId) : undefined,
    status: raw.status,
  };
}

export function mapComment(raw: RawComment): Comment {
  return {
    id: raw._id,
    postId: raw.blog,
    author: mapAuthor(raw.user),
    content: raw.content,
    createdAt: raw.createdAt,
    likes: raw.likes?.length ?? 0,
    replies: raw.replies?.map(mapComment),
  };
}
