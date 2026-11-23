import { request } from '../../../services/http-client';
import { appendPageQuery, pageSchema, type Page, type PageQuery } from '../../../shared/lib/pagination';
import { postSchema, type Post, type PostInput } from '../model/post-schemas';

export interface PostQuery extends PageQuery {
  /** Lọc theo tên môn học hoặc mã học phần; rỗng = tất cả. */
  subject?: string;
}

const postPageSchema = pageSchema(postSchema);

/** GET /posts?subject=&cursor=&limit= → { items, nextCursor }, mới nhất trước. */
export async function listPosts(query: PostQuery = {}, signal?: AbortSignal): Promise<Page<Post>> {
  const params = new URLSearchParams();
  if (query.subject) params.set('subject', query.subject);
  appendPageQuery(params, query);
  const search = params.size ? `?${params}` : '';
  return postPageSchema.parse(await request(`/posts${search}`, { signal }));
}

export async function getPost(postId: string, signal?: AbortSignal): Promise<Post> {
  return postSchema.parse(await request(`/posts/${encodeURIComponent(postId)}`, { signal }));
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
