import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb } from '../../../test/mock-db';
import * as api from '../api/admin-users-api.mock';
import type { UserListQuery } from '../model/admin-user-schemas';

const BASE: UserListQuery = { page: 1, limit: 10, search: '', role: '', status: '' };

describe('mock admin users API', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start('u-admin');
  });

  it('phân trang 10 người mỗi trang và tính đúng số trang', async () => {
    const result = await api.listUsers(BASE);
    expect(result.items).toHaveLength(10);
    expect(result.pagination.total).toBe(mockDb.listAccounts().length);
    expect(result.pagination.totalPages).toBe(Math.ceil(result.pagination.total / 10));
  });

  it('sắp xếp người mới tạo lên đầu', async () => {
    const { items } = await api.listUsers({ ...BASE, limit: 50 });
    const times = items.map((user) => Date.parse(user.createdAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('tìm theo MSSV ra đúng người', async () => {
    const { items } = await api.listUsers({ ...BASE, search: '21110782' });
    expect(items.map((user) => user.fullName)).toEqual(['Minh Tuấn']);
  });

  it('tìm không phân biệt hoa thường trên tên và email', async () => {
    const { items } = await api.listUsers({ ...BASE, search: 'PHAM.HOANG' });
    expect(items.map((user) => user.fullName)).toEqual(['Phạm H.']);
  });

  it('lọc Đã khóa chỉ ra tài khoản BANNED', async () => {
    const { items } = await api.listUsers({ ...BASE, status: 'BANNED', limit: 50 });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((user) => user.status === 'BANNED')).toBe(true);
  });

  it('khóa người khác thì danh sách thấy BANNED', async () => {
    const updated = await api.updateUserStatus('u-minh-tuan', 'BANNED');
    expect(updated).toMatchObject({ id: 'u-minh-tuan', status: 'BANNED' });
    const { items } = await api.listUsers({ ...BASE, search: '21110782' });
    expect(items[0].status).toBe('BANNED');
  });

  it('đổi quyền người khác thành ADMIN', async () => {
    const updated = await api.updateUserRole('u-khac', 'ADMIN');
    expect(updated.role).toBe('ADMIN');
  });

  it('không cho admin tự khóa hoặc tự hạ quyền', async () => {
    await expect(api.updateUserStatus('u-admin', 'BANNED')).rejects.toMatchObject({ status: 400 });
    await expect(api.updateUserRole('u-admin', 'USER')).rejects.toMatchObject({ status: 400 });
  });

  it('chi tiết người không tồn tại trả 404', async () => {
    await expect(api.getUserById('khong-ton-tai')).rejects.toMatchObject({
      status: 404,
      message: 'Không tìm thấy người dùng này.',
    });
  });

  it('chi tiết có dữ liệu mở rộng cho ngăn chi tiết', async () => {
    const detail = await api.getUserById('u-minh-tuan');
    expect(detail.trustScore).toBe(98);
    expect(detail.stats).not.toBeNull();
    expect(detail.spaces?.length).toBeGreaterThan(0);
    expect(detail.recentPosts?.length).toBeGreaterThan(0);
  });

  it('thống kê danh bạ có số như thiết kế', async () => {
    const stats = await api.getDirectoryStats();
    expect(stats?.online.value).toBe(3482);
  });
});
