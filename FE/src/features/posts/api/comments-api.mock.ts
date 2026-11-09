// Mock Comment API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với comments-api.ts.
import { ApiError } from '../../../services/http-client';
import type { Page } from '../../../shared/lib/pagination';
import { mockDb } from '../../../test/mock-db';
import type { Comment, CommentInput } from '../model/comment-schemas';
import type { CommentQuery } from './comments-api';
import { findPost, mockStore, nowIso, paginate, requireSession } from './posts-mock-store';

const DEFAULT_LIMIT = 10;

function findOwnComment(comments: Comment[], commentId: string, userId: string) {
  const comment = comments.find((item) => item.id === commentId);
  if (!comment) throw new ApiError(404, 'Bình luận không tồn tại hoặc đã bị xóa.');
  if (comment.author.id !== userId) throw new ApiError(403, 'Bạn không có quyền chỉnh sửa bình luận này.');
  return comment;
}

export async function listComments(postId: string, query: CommentQuery = {}, signal?: AbortSignal): Promise<Page<Comment>> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  requireSession();
  const { posts, comments } = mockStore.load();
  findPost(posts, postId);
  const parentId = query.parentId ?? null;
  const thread = comments.filter((comment) => comment.postId === postId && comment.parentId === parentId);
  // Bình luận gốc: mới nhất trước. Phản hồi: đọc theo thứ tự hội thoại, cũ nhất trước.
  return paginate(thread, parentId ? 'asc' : 'desc', query.cursor, query.limit ?? DEFAULT_LIMIT);
}

export async function createComment(postId: string, input: CommentInput): Promise<Comment> {
  await mockDb.delay(300);
  const userId = requireSession();
  const data = mockStore.load();
  const post = findPost(data.posts, postId);

  if (input.parentId) {
    const parent = data.comments.find((comment) => comment.id === input.parentId && comment.postId === postId);
    if (!parent) throw new ApiError(404, 'Bình luận bạn trả lời không còn tồn tại.');
    if (parent.parentId) throw new ApiError(400, 'Chỉ có thể trả lời bình luận gốc.');
    parent.replyCount += 1;
  }

  const profile = mockDb.getProfile(userId);
  const now = nowIso();
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    parentId: input.parentId,
    author: { id: userId, fullName: profile?.fullName ?? 'Bạn', avatarUrl: profile?.avatarUrl ?? null },
    content: input.content,
    replyCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  post.commentCount += 1;
  mockStore.save({ posts: data.posts, comments: [...data.comments, comment] });
  return comment;
}

export async function updateComment(commentId: string, input: { content: string }): Promise<Comment> {
  await mockDb.delay(300);
  const userId = requireSession();
  const data = mockStore.load();
  const comment = findOwnComment(data.comments, commentId, userId);
  Object.assign(comment, { content: input.content, updatedAt: nowIso() });
  mockStore.save(data);
  return comment;
}

export async function deleteComment(commentId: string): Promise<void> {
  await mockDb.delay(300);
  const userId = requireSession();
  const data = mockStore.load();
  const comment = findOwnComment(data.comments, commentId, userId);
  const removedIds = new Set([comment.id, ...data.comments.filter((c) => c.parentId === comment.id).map((c) => c.id)]);

  const post = data.posts.find((item) => item.id === comment.postId);
  if (post) post.commentCount = Math.max(0, post.commentCount - removedIds.size);
  const parent = comment.parentId ? data.comments.find((item) => item.id === comment.parentId) : undefined;
  if (parent) parent.replyCount = Math.max(0, parent.replyCount - 1);

  mockStore.save({ posts: data.posts, comments: data.comments.filter((item) => !removedIds.has(item.id)) });
}
