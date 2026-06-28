export interface RawUser {
  _id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  role: "user" | "admin";
  followers: string[];
  following: string[];
  savedBlogs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RawCategory {
  _id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  postCount?: number;
}

export interface RawBlog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: RawCategory;
  tags: string[];
  author: RawUser;
  status: "published" | "draft";
  views: number;
  likes: string[];
  likesCount?: number;
  bookmarksCount: number;
  commentsCount: number;
  readTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RawComment {
  _id: string;
  blog: string;
  user: RawUser;
  content: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  replies?: RawComment[];
}

export interface ProfileStats {
  publishedCount: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
}
