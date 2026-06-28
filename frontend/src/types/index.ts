export interface Author {
  id: string;
  username: string;
  name: string;
  bio: string;
  role: string;
  followers: number;
  following: number;
  postsCount: number;
  joinedAt: string;
  isFollowing?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  postCount: number;
  description?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: Author;
  category: Category;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt?: string;
  likes: number;
  comments: number;
  bookmarks: number;
  views: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  status: "published" | "draft";
}
