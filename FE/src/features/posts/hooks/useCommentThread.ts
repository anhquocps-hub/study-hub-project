import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../../services/http-client';
import { mergeById } from '../../../shared/lib/pagination';
import { commentsApi } from '../api';
import type { Comment } from '../model/comment-schemas';

export const COMMENT_PAGE_SIZE = 5;

type ThreadStatus = 'idle' | 'loading' | 'error' | 'success';

/**
 * Một luồng bình luận: bình luận gốc của bài (parentId = null) hoặc phản hồi của một bình luận gốc.
 * - Chỉ tải khi `enabled` (ví dụ người dùng bấm mở bình luận / "Xem phản hồi").
 * - create/update/remove ném lỗi để form hiển thị; remove trả về số bình luận đã bị xóa (gồm phản hồi)
 *   để nơi gọi cập nhật commentCount của bài.
 * - Kết quả của request cũ (đổi bài, thử lại, rời trang) bị bỏ qua để không ghi đè dữ liệu mới.
 */
export function useCommentThread(postId: string, parentId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<ThreadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  /** Tín hiệu hủy của "phiên" tải hiện tại; mọi request sau đó kiểm tra để bỏ kết quả cũ. */
  const sessionRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const session = new AbortController();
    sessionRef.current = session;
    setStatus('loading');
    setError(null);
    setComments([]);
    setNextCursor(null);
    setIsLoadingMore(false);
    setLoadMoreError(null);
    commentsApi
      .listComments(postId, { ...(parentId ? { parentId } : {}), limit: COMMENT_PAGE_SIZE }, session.signal)
      .then((page) => {
        if (session.signal.aborted) return;
        setComments(page.items);
        setNextCursor(page.nextCursor);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (session.signal.aborted) return;
        setError(getErrorMessage(err));
        setStatus('error');
      });
    return () => {
      session.abort();
      if (sessionRef.current === session) sessionRef.current = null;
    };
  }, [postId, parentId, enabled, reloadCount]);

  const retry = useCallback(() => setReloadCount((count) => count + 1), []);

  const loadMore = async () => {
    const signal = sessionRef.current?.signal;
    if (!nextCursor || isLoadingMore || !signal) return;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const query = { ...(parentId ? { parentId } : {}), cursor: nextCursor, limit: COMMENT_PAGE_SIZE };
      const page = await commentsApi.listComments(postId, query, signal);
      if (signal.aborted) return;
      setComments((list) => mergeById(list, page.items));
      setNextCursor(page.nextCursor);
    } catch (err) {
      if (!signal.aborted) setLoadMoreError(getErrorMessage(err));
    } finally {
      if (!signal.aborted) setIsLoadingMore(false);
    }
  };

  const create = async (content: string) => {
    const signal = sessionRef.current?.signal;
    const comment = await commentsApi.createComment(postId, { content, parentId });
    if (!signal?.aborted) {
      setComments((list) => {
        if (!parentId) return [comment, ...list]; // bình luận gốc mới hiện trên cùng
        // Phản hồi xếp cũ → mới: nếu còn trang chưa tải, phản hồi mới sẽ đến đúng chỗ ở trang cuối.
        return nextCursor ? list : [...list, comment];
      });
    }
    return comment;
  };

  const update = async (commentId: string, content: string) => {
    const signal = sessionRef.current?.signal;
    const updated = await commentsApi.updateComment(commentId, { content });
    if (!signal?.aborted) setComments((list) => list.map((comment) => (comment.id === updated.id ? updated : comment)));
  };

  const remove = async (commentId: string): Promise<number> => {
    const signal = sessionRef.current?.signal;
    const target = comments.find((comment) => comment.id === commentId);
    await commentsApi.deleteComment(commentId);
    if (!signal?.aborted) setComments((list) => list.filter((comment) => comment.id !== commentId));
    return 1 + (target?.replyCount ?? 0);
  };

  /** Phản hồi được thêm/xóa trong luồng con: cập nhật số phản hồi của bình luận gốc. */
  const adjustReplyCount = useCallback((commentId: string, delta: number) => {
    setComments((list) =>
      list.map((comment) =>
        comment.id === commentId ? { ...comment, replyCount: Math.max(0, comment.replyCount + delta) } : comment,
      ),
    );
  }, []);

  return {
    status,
    error,
    retry,
    comments,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreError,
    loadMore,
    create,
    update,
    remove,
    adjustReplyCount,
  };
}
