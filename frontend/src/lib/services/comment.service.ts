import { api, ListMeta } from "@/lib/api-client";
import { RawComment } from "@/types/api";

export async function getBlogComments(
  blogId: string,
  params: { page?: number; limit?: number } = {}
): Promise<{ comments: RawComment[]; meta?: ListMeta }> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  const { data, meta } = await api.getWithMeta<{ comments: RawComment[] }>(
    `/blogs/${blogId}/comments${qs ? `?${qs}` : ""}`
  );
  return { comments: data.comments, meta };
}

export async function addComment(
  blogId: string,
  content: string,
  parentComment?: string
): Promise<RawComment> {
  const data = await api.post<{ comment: RawComment }>(`/blogs/${blogId}/comments`, {
    content,
    parentComment,
  });
  return data.comment;
}

export async function updateComment(id: string, content: string): Promise<RawComment> {
  const data = await api.patch<{ comment: RawComment }>(`/comments/${id}`, { content });
  return data.comment;
}

export async function deleteComment(id: string): Promise<void> {
  await api.delete(`/comments/${id}`);
}
