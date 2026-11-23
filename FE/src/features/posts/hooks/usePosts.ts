import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../../../services/http-client';
import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { mergeById } from '../../../shared/lib/pagination';
import { postsApi } from '../api';
import type { Post, PostInput } from '../model/post-schemas';

/** Số bài mỗi lần tải trên bảng tin. */
export const FEED_PAGE_SIZE = 5;

/**
 * Bảng tin có phân trang + các thao tác tạo/sửa/xóa/thích.
 * Sau mỗi thao tác chỉ cập nhật đúng bài bị đổi trong danh sách, không tải lại cả feed.
 * Lỗi của thao tác được ném ra để nơi gọi (form, nút) hiển thị; lỗi "xem thêm" nằm ở loadMoreError.
 */
export function usePosts(subject: string) {
  const { state, retry } = useAsyncData(`posts:${subject}`, (signal) =>
    postsApi.listPosts({ subject, limit: FEED_PAGE_SIZE }, signal),
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const loadMoreRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Tải lại (thử lại / đổi bộ lọc): bỏ lượt "xem thêm" của danh sách cũ.
    loadMoreRef.current?.abort();
    loadMoreRef.current = null;
    setIsLoadingMore(false);
    if (state.status !== 'success') return;
    setPosts(state.data.items);
    setNextCursor(state.data.nextCursor);
    setLoadMoreError(null);
  }, [state]);

  useEffect(() => () => loadMoreRef.current?.abort(), []); // rời trang

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadMoreRef.current) return;
    const controller = new AbortController();
    loadMoreRef.current = controller;
    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const page = await postsApi.listPosts({ subject, cursor: nextCursor, limit: FEED_PAGE_SIZE }, controller.signal);
      if (controller.signal.aborted) return;
      setPosts((list) => mergeById(list, page.items));
      setNextCursor(page.nextCursor);
    } catch (error) {
      if (!controller.signal.aborted) setLoadMoreError(getErrorMessage(error));
    } finally {
      if (loadMoreRef.current === controller) {
        loadMoreRef.current = null;
        setIsLoadingMore(false);
      }
    }
  }, [nextCursor, subject]);

  const replace = useCallback(
    (updated: Post) => setPosts((list) => list.map((post) => (post.id === updated.id ? updated : post))),
    [],
  );

  const create = useCallback(
    async (input: PostInput) => {
      const post = await postsApi.createPost(input);
      // Đang lọc theo môn: tải lại để chỉ hiện bài khớp bộ lọc (BE quyết định khớp hay không).
      if (subject) retry();
      else setPosts((list) => [post, ...list]);
    },
    [subject, retry],
  );

  const update = useCallback(async (postId: string, input: PostInput) => {
    replace(await postsApi.updatePost(postId, input));
  }, [replace]);

  const remove = useCallback(async (postId: string) => {
    await postsApi.deletePost(postId);
    setPosts((list) => list.filter((post) => post.id !== postId));
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    replace(await postsApi.toggleLike(postId));
  }, [replace]);

  /** Bình luận được thêm/xóa trong CommentSection: cập nhật số đếm trên thẻ bài. */
  const adjustCommentCount = useCallback((postId: string, delta: number) => {
    setPosts((list) =>
      list.map((post) => (post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount + delta) } : post)),
    );
  }, []);

  return {
    state,
    retry,
    posts,
    hasMore: nextCursor !== null,
    isLoadingMore,
    loadMoreError,
    loadMore,
    create,
    update,
    remove,
    toggleLike,
    adjustCommentCount,
  };
}
