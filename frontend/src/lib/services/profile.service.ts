import { api, ListMeta } from "@/lib/api-client";
import { RawUser, RawBlog, ProfileStats } from "@/types/api";

export async function getProfile(username: string): Promise<{ user: RawUser; stats: ProfileStats }> {
  return api.get<{ user: RawUser; stats: ProfileStats }>(`/profile/${encodeURIComponent(username)}`);
}

export async function updateProfile(input: { name?: string; bio?: string }): Promise<RawUser> {
  const data = await api.patch<{ user: RawUser }>("/profile/me", input);
  return data.user;
}

export async function getUserBlogs(
  username: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ blogs: RawBlog[]; meta?: ListMeta }> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const { data, meta } = await api.getWithMeta<{ blogs: RawBlog[] }>(
    `/profile/${encodeURIComponent(username)}/blogs${qs ? `?${qs}` : ""}`
  );
  return { blogs: data.blogs, meta };
}

export async function toggleFollow(
  username: string
): Promise<{ following: boolean; followersCount: number }> {
  return api.post<{ following: boolean; followersCount: number }>(
    `/profile/${encodeURIComponent(username)}/follow`
  );
}
