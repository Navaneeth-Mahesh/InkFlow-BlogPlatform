import { api } from "@/lib/api-client";

export async function toggleLike(blogId: string): Promise<{ liked: boolean; likesCount: number }> {
  return api.post<{ liked: boolean; likesCount: number }>(`/blogs/${blogId}/like/toggle`);
}
