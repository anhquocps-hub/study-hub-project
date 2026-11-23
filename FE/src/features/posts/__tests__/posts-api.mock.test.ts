import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb } from '../../../test/mock-db';
import * as postsApi from '../api/posts-api.mock';

const DEMO_USER = 'u-demo';

describe('mock posts API', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start(DEMO_USER);
  });

  describe('listPosts (phân trang)', () => {
    it('trả về trang đầu theo limit kèm nextCursor', async () => {
      const page = await postsApi.listPosts({ limit: 2 });
      expect(page.items).toHaveLength(2);
      expect(page.nextCursor).not.toBeNull();
    });

    it('trang sau nối tiếp trang trước, không trùng và kết thúc bằng nextCursor = null', async () => {
      const seen: string[] = [];
      let cursor: string | null = null;
      let pages = 0;
      do {
        const page = await postsApi.listPosts({ limit: 2, cursor });
        seen.push(...page.items.map((post) => post.id));
        cursor = page.nextCursor;
        pages += 1;
      } while (cursor && pages < 20);

      expect(cursor).toBeNull();
      expect(new Set(seen).size).toBe(seen.length);
      const all = await postsApi.listPosts({ limit: 100 });
      expect(seen).toEqual(all.items.map((post) => post.id));
    });

    it('sắp xếp mới nhất trước', async () => {
      const { items } = await postsApi.listPosts({ limit: 100 });
      const times = items.map((post) => post.createdAt);
      expect(times).toEqual([...times].sort().reverse());
    });

    it('bài mới đăng giữa chừng không làm trang sau bị trùng', async () => {
      const first = await postsApi.listPosts({ limit: 2 });
      await postsApi.createPost({
        type: 'GENERAL',
        content: 'Bài viết mới đăng trong lúc đang cuộn feed',
        tags: [],
        subject: '',
        classCode: '',
        semester: null,
        lecturer: null,
      });
      const second = await postsApi.listPosts({ limit: 2, cursor: first.nextCursor });
      const firstIds = first.items.map((post) => post.id);
      expect(second.items.some((post) => firstIds.includes(post.id))).toBe(false);
    });

    it('lọc theo môn học vẫn phân trang', async () => {
      const page = await postsApi.listPosts({ subject: 'Cơ sở dữ liệu', limit: 10 });
      expect(page.items.length).toBeGreaterThan(0);
      expect(page.items.every((post) => post.course?.subject === 'Cơ sở dữ liệu')).toBe(true);
    });

    it('yêu cầu đăng nhập', async () => {
      mockDb.session.end();
      await expect(postsApi.listPosts({})).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('getPost', () => {
    it('trả về đúng bài viết', async () => {
      const { items } = await postsApi.listPosts({ limit: 1 });
      const post = await postsApi.getPost(items[0].id);
      expect(post).toEqual(items[0]);
    });

    it('báo 404 khi bài không tồn tại', async () => {
      await expect(postsApi.getPost('khong-ton-tai')).rejects.toMatchObject({ status: 404 });
    });
  });
});
