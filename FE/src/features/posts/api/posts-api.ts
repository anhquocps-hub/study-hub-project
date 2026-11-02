import { z } from 'zod';
import { request } from '../../../services/http-client';
import { postSchema, type Post, type PostInput } from '../model/post-schemas';

export interface PostQuery {
  /** Lọc theo tên môn học hoặc mã học phần; rỗng = tất cả. */
  subject?: string;
}

export async function listPosts(query: PostQuery = {}, signal?: AbortSignal): Promise<Post[]> {
  const params = new URLSearchParams();
  if (query.subject) params.set('subject', query.subject);
  const search = params.size ? `?${params}` : '';
  return z.array(postSchema).parse(await request(`/posts${search}`, { signal }));
}

export async function createPost(input: PostInput): Promise<Post> {
  return postSchema.parse(await request('/posts', { method: 'POST', body: JSON.stringify(input) }));
}

export async function updatePost(postId: string, input: PostInput): Promise<Post> {
  const data = await request(`/posts/${encodeURIComponent(postId)}`, { method: 'PATCH', body: JSON.stringify(input) });
  return postSchema.parse(data);
}

export async function deletePost(postId: string): Promise<void> {
  await request(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });
}

/** Bật/tắt thích; BE trả về bài viết sau khi cập nhật. */
export async function toggleLike(postId: string): Promise<Post> {
  return postSchema.parse(await request(`/posts/${encodeURIComponent(postId)}/like`, { method: 'POST' }));
}
