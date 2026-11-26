import { afterEach, describe, expect, it, vi } from 'vitest';
import * as api from '../api/admin-users-api';

const BE_USER = {
  id: 'u1',
  email: 'an@student.hcmute.edu.vn',
  fullName: 'Nguyễn An',
  studentId: '21110001',
  role: 'USER',
  status: 'ACTIVE',
  profileCompleted: true,
  createdAt: '2025-01-02T03:04:05.000Z',
  university: { id: 'hcmute', name: 'HCMUTE' },
};

function stubFetch(body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('admin users API thật', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listUsers gửi đúng tham số, bỏ tham số rỗng và để trống trường mở rộng', async () => {
    const fetchMock = stubFetch({ items: [BE_USER], pagination: { page: 2, limit: 20, total: 21, totalPages: 2 } });
    const result = await api.listUsers({ page: 2, limit: 20, search: 'an', role: '', status: 'BANNED' });

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.pathname).toBe('/users');
    expect(url.search).toBe('?page=2&limit=20&search=an&status=BANNED');
    expect(result.items[0]).toMatchObject({ id: 'u1', trustScore: null, moderation: null, faculty: null });
    expect(result.pagination.totalPages).toBe(2);
  });

  it('getUserById lấy avatar, khóa và kỹ năng từ profile', async () => {
    stubFetch({
      ...BE_USER,
      profile: { avatarUrl: 'https://cdn/a.png', cohort: 'K21', skills: [{ name: 'React', level: 'ADVANCED' }] },
    });
    const detail = await api.getUserById('u1');
    expect(detail).toMatchObject({ avatarUrl: 'https://cdn/a.png', cohort: 'K21', skills: ['React'] });
    expect(detail.stats).toBeNull();
    expect(detail.spaces).toBeNull();
  });

  it('getUserById không có profile thì các trường đó là null', async () => {
    stubFetch({ ...BE_USER, profile: null });
    const detail = await api.getUserById('u1');
    expect(detail).toMatchObject({ avatarUrl: null, cohort: null, skills: null });
  });

  it('getDirectoryStats trả null và không gọi BE', async () => {
    const fetchMock = stubFetch({});
    expect(await api.getDirectoryStats()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('updateUserStatus gửi PATCH tới /users/:id/status', async () => {
    const fetchMock = stubFetch({ id: 'u1', email: BE_USER.email, fullName: 'Nguyễn An', role: 'USER', status: 'BANNED' });
    const updated = await api.updateUserStatus('u1', 'BANNED');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new URL(url).pathname).toBe('/users/u1/status');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({ status: 'BANNED' });
    expect(updated).toEqual({ id: 'u1', role: 'USER', status: 'BANNED' });
  });
});
