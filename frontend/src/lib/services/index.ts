import { api, ListMeta } from "@/lib/api-client";
import { RawCategory, RawBlog, RawUser } from "@/types/api";

export async function getCategories(): Promise<RawCategory[]> {
  const data = await api.get<{ categories: RawCategory[] }>("/categories");
  return data.categories;
}

export async function searchBlogs(
  q: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ blogs: RawBlog[]; meta?: ListMeta }> {
  const search = new URLSearchParams({ q, scope: "blogs" });
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const { data, meta } = await api.getWithMeta<{ blogs: RawBlog[] }>(`/search?${search}`);
  return { blogs: data.blogs, meta };
}

export async function searchAuthors(
  q: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ authors: RawUser[]; meta?: ListMeta }> {
  const search = new URLSearchParams({ q, scope: "authors" });
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const { data, meta } = await api.getWithMeta<{ authors: RawUser[] }>(`/search?${search}`);
  return { authors: data.authors, meta };
}

export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("image", file);
  return api.post<{ url: string; publicId: string }>("/upload/image", formData, {
    isFormData: true,
  });
}
