import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb } from '../../../test/mock-db';
import { useCommentThread } from '../hooks/useCommentThread';
import { FEED_PAGE_SIZE, usePosts } from '../hooks/usePosts';

beforeEach(() => {
  vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  mockDb.session.start('u-demo');
});

describe('usePosts', () => {
  it('tải trang đầu rồi "xem thêm" để nối trang sau đến khi hết', async () => {
    const { result } = renderHook(() => usePosts(''));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.posts).toHaveLength(FEED_PAGE_SIZE);
    expect(result.current.hasMore).toBe(true);

    await act(() => result.current.loadMore());

    expect(result.current.posts.length).toBeGreaterThan(FEED_PAGE_SIZE);
    expect(new Set(result.current.posts.map((post) => post.id)).size).toBe(result.current.posts.length);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('báo lỗi khi tải thêm thất bại mà vẫn giữ danh sách cũ', async () => {
    const { result } = renderHook(() => usePosts(''));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    mockDb.session.end();

    await act(() => result.current.loadMore());

    expect(result.current.posts).toHaveLength(FEED_PAGE_SIZE);
    expect(result.current.loadMoreError).toMatch(/đăng nhập/);
    expect(result.current.hasMore).toBe(true);
  });

  it('tạo bài khi đang lọc theo môn: không chèn bài không khớp bộ lọc', async () => {
    const { result } = renderHook(() => usePosts('Cơ sở dữ liệu'));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    const before = result.current.posts.map((post) => post.id);

    await act(() =>
      result.current.create({
        type: 'GENERAL',
        content: 'Bài viết về chủ đề khác hoàn toàn',
        tags: [],
        subject: '',
        classCode: '',
        semester: null,
        lecturer: null,
      }),
    );

    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(result.current.posts.map((post) => post.id)).toEqual(before);
  });

  it('cập nhật số bình luận của một bài mà không tải lại feed', async () => {
    const { result } = renderHook(() => usePosts(''));
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    const [first] = result.current.posts;

    act(() => result.current.adjustCommentCount(first.id, 2));

    expect(result.current.posts[0].commentCount).toBe(first.commentCount + 2);
  });
});

describe('useCommentThread', () => {
  const POST_ID = 'post-expense-tracker';

  it('không tải khi chưa bật (enabled = false), bật lên mới tải', async () => {
    const { result, rerender } = renderHook(({ enabled }) => useCommentThread(POST_ID, null, enabled), {
      initialProps: { enabled: false },
    });
    await act(() => Promise.resolve());
    expect(result.current.status).toBe('idle');
    expect(result.current.comments).toEqual([]);

    rerender({ enabled: true });
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.comments.length).toBeGreaterThan(0);
  });

  it('tải bình luận gốc, tạo mới thì hiện đầu danh sách', async () => {
    const { result } = renderHook(() => useCommentThread(POST_ID, null, true));
    await waitFor(() => expect(result.current.status).toBe('success'));
    const before = result.current.comments.length;

    await act(async () => {
      await result.current.create('Bình luận mới');
    });

    expect(result.current.comments).toHaveLength(before + 1);
    expect(result.current.comments[0].content).toBe('Bình luận mới');
  });

  it('phản hồi mới được thêm vào cuối luồng', async () => {
    const { result } = renderHook(() => useCommentThread(POST_ID, 'c-1', true));
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.create('Phản hồi mới');
    });

    const last = result.current.comments.at(-1);
    expect(last?.content).toBe('Phản hồi mới');
    expect(last?.parentId).toBe('c-1');
  });

  it('xóa bình luận gốc trả về số bình luận bị xóa (gồm cả phản hồi)', async () => {
    mockDb.session.start('u-bao'); // tác giả c-1, c-1 có 1 phản hồi
    const { result } = renderHook(() => useCommentThread(POST_ID, null, true));
    await waitFor(() => expect(result.current.status).toBe('success'));

    let removed = 0;
    await act(async () => {
      removed = await result.current.remove('c-1');
    });

    expect(removed).toBe(2);
    expect(result.current.comments.some((comment) => comment.id === 'c-1')).toBe(false);
  });

  it('sửa bình luận cập nhật đúng phần tử', async () => {
    mockDb.session.start('u-bao');
    const { result } = renderHook(() => useCommentThread(POST_ID, null, true));
    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.update('c-1', 'Nội dung đã sửa');
    });

    expect(result.current.comments.find((comment) => comment.id === 'c-1')?.content).toBe('Nội dung đã sửa');
  });

  it('adjustReplyCount đổi replyCount của bình luận gốc', async () => {
    const { result } = renderHook(() => useCommentThread(POST_ID, null, true));
    await waitFor(() => expect(result.current.status).toBe('success'));
    const before = result.current.comments.find((comment) => comment.id === 'c-1')?.replyCount ?? 0;

    act(() => result.current.adjustReplyCount('c-1', 1));

    expect(result.current.comments.find((comment) => comment.id === 'c-1')?.replyCount).toBe(before + 1);
  });

  it('báo lỗi khi bài viết không tồn tại', async () => {
    const { result } = renderHook(() => useCommentThread('khong-ton-tai', null, true));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatch(/không tồn tại/);
  });
});
