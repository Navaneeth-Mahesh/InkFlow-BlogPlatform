import { api, ListMeta } from "@/lib/api-client";
import { RawBlog } from "@/types/api";

export interface ListBlogsParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  sort?: "latest" | "popular" | "discussed" | "trending";
  q?: string;
}

function toQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listBlogs(
  params: ListBlogsParams = {}
): Promise<{ blogs: RawBlog[]; meta?: ListMeta }> {
  const { data, meta } = await api.getWithMeta<{ blogs: RawBlog[] }>(
    `/blogs${toQueryString({ ...params })}`
  );
  return { blogs: data.blogs, meta };
}

export async function getTrendingBlogs(limit = 6): Promise<RawBlog[]> {
  const data = await api.get<{ blogs: RawBlog[] }>(`/blogs/trending?limit=${limit}`);
  return data.blogs;
}

export async function getBlogBySlug(slug: string): Promise<RawBlog> {
  const data = await api.get<{ blog: RawBlog }>(`/blogs/slug/${encodeURIComponent(slug)}`);
  return data.blog;
}

export async function getRelatedBlogs(blogId: string, limit = 3): Promise<RawBlog[]> {
  const data = await api.get<{ blogs: RawBlog[] }>(`/blogs/${blogId}/related?limit=${limit}`);
  return data.blogs;
}

export async function getMyBlogs(
  params: { page?: number; limit?: number; status?: "published" | "draft" } = {}
): Promise<{ blogs: RawBlog[]; meta?: ListMeta }> {
  const { data, meta } = await api.getWithMeta<{ blogs: RawBlog[] }>(
    `/blogs/my-blogs${toQueryString({ ...params })}`
  );
  return { blogs: data.blogs, meta };
}

export interface CreateBlogInput {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  status?: "published" | "draft";
}

export async function createBlog(input: CreateBlogInput): Promise<RawBlog> {
  const data = await api.post<{ blog: RawBlog }>("/blogs", input);
  return data.blog;
}

export async function updateBlog(id: string, input: Partial<CreateBlogInput>): Promise<RawBlog> {
  const data = await api.patch<{ blog: RawBlog }>(`/blogs/${id}`, input);
  return data.blog;
}

export async function deleteBlog(id: string): Promise<void> {
  await api.delete(`/blogs/${id}`);
}
