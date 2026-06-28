import { api, ListMeta } from "@/lib/api-client";
import { RawBlog } from "@/types/api";

export async function toggleBookmark(blogId: string): Promise<{ saved: boolean }> {
  return api.post<{ saved: boolean }>(`/bookmarks/blogs/${blogId}/bookmark/toggle`);
}

export async function getSavedBlogs(
  params: { page?: number; limit?: number } = {}
): Promise<{ blogs: RawBlog[]; meta?: ListMeta }> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const { data, meta } = await api.getWithMeta<{ blogs: RawBlog[] }>(
    `/bookmarks/saved${qs ? `?${qs}` : ""}`
  );
  return { blogs: data.blogs, meta };
}
