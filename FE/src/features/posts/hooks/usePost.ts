import { useCallback, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { postsApi } from '../api';
import type { Post, PostInput } from '../model/post-schemas';

/**
 * Một bài viết (trang chi tiết) + sửa/xóa/thích/cập nhật số bình luận tại chỗ.
 * Thay đổi tại chỗ lưu kèm bản đã tải gốc (`base`): tải lại hoặc đổi bài thì tự bỏ thay đổi cũ.
 */
export function usePost(postId: string) {
  const { state, retry } = useAsyncData(`post:${postId}`, (signal) => postsApi.getPost(postId, signal));
  const [local, setLocal] = useState<{ base: Post; data: Post } | null>(null);
  const loaded = state.status === 'success' ? state.data : null;
  const post = loaded && local?.base === loaded ? local.data : loaded;

  const apply = useCallback(
    (change: (current: Post) => Post) => {
      if (!loaded) return;
      setLocal((prev) => ({ base: loaded, data: change(prev?.base === loaded ? prev.data : loaded) }));
    },
    [loaded],
  );

  const update = useCallback(
    async (input: PostInput) => {
      const updated = await postsApi.updatePost(postId, input);
      apply(() => updated);
    },
    [postId, apply],
  );

  const remove = useCallback(() => postsApi.deletePost(postId), [postId]);

  const toggleLike = useCallback(async () => {
    const updated = await postsApi.toggleLike(postId);
    apply(() => updated);
  }, [postId, apply]);

  const adjustCommentCount = useCallback(
    (delta: number) => apply((current) => ({ ...current, commentCount: Math.max(0, current.commentCount + delta) })),
    [apply],
  );

  return { state, retry, post, update, remove, toggleLike, adjustCommentCount };
}
