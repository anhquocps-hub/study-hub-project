import { useCallback, useEffect, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { postsApi } from '../api';
import type { Post, PostInput } from '../model/post-schemas';

/**
 * Danh sách bài viết + các thao tác tạo/sửa/xóa/thích.
 * Sau mỗi thao tác chỉ cập nhật đúng bài bị đổi trong danh sách, không tải lại cả feed.
 * Lỗi được ném ra để nơi gọi (form, nút) hiển thị.
 */
export function usePosts(subject: string) {
  const { state, retry } = useAsyncData(`posts:${subject}`, (signal) => postsApi.listPosts({ subject }, signal));
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (state.status === 'success') setPosts(state.data);
  }, [state]);

  const replace = (updated: Post) => setPosts((list) => list.map((post) => (post.id === updated.id ? updated : post)));

  const create = useCallback(async (input: PostInput) => {
    const post = await postsApi.createPost(input);
    setPosts((list) => [post, ...list]);
  }, []);

  const update = useCallback(async (postId: string, input: PostInput) => {
    replace(await postsApi.updatePost(postId, input));
  }, []);

  const remove = useCallback(async (postId: string) => {
    await postsApi.deletePost(postId);
    setPosts((list) => list.filter((post) => post.id !== postId));
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    replace(await postsApi.toggleLike(postId));
  }, []);

  return { state, retry, posts, create, update, remove, toggleLike };
}
