import { request } from '../../../services/http-client';
import { appendPageQuery, pageSchema, type Page, type PageQuery } from '../../../shared/lib/pagination';
import { commentSchema, type Comment, type CommentInput } from '../model/comment-schemas';

export interface CommentQuery extends PageQuery {
  /** Bỏ trống = bình luận gốc (mới nhất trước); có id = phản hồi của bình luận đó (cũ nhất trước). */
  parentId?: string;
}

const commentPageSchema = pageSchema(commentSchema);

/** GET /posts/:postId/comments?parentId=&cursor=&limit= → { items, nextCursor }. */
export async function listComments(postId: string, query: CommentQuery = {}, signal?: AbortSignal): Promise<Page<Comment>> {
  const params = new URLSearchParams();
  if (query.parentId) params.set('parentId', query.parentId);
  appendPageQuery(params, query);
  const search = params.size ? `?${params}` : '';
  return commentPageSchema.parse(await request(`/posts/${encodeURIComponent(postId)}/comments${search}`, { signal }));
}

export async function createComment(postId: string, input: CommentInput): Promise<Comment> {
  const data = await request(`/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return commentSchema.parse(data);
}

export async function updateComment(commentId: string, input: { content: string }): Promise<Comment> {
  const data = await request(`/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return commentSchema.parse(data);
}

/** Xóa bình luận gốc thì BE xóa luôn các phản hồi của nó. */
export async function deleteComment(commentId: string): Promise<void> {
  await request(`/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
}
