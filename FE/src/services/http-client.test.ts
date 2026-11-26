import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, onAuthEvent, request } from './http-client';

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

/**
 * fetch giả: `/auth/refresh` trả `refreshStatus`; các đường dẫn khác trả 401 cho tới khi đã refresh thành công.
 */
function stubServer({ refreshStatus = 200 }: { refreshStatus?: number } = {}) {
  let refreshed = false;
  const fetchMock = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    if (path === '/auth/refresh') {
      await new Promise((resolve) => setTimeout(resolve, 10));
      refreshed = refreshStatus === 200;
      return json(refreshStatus, refreshStatus === 200 ? { id: 'u1' } : { message: 'Refresh token không hợp lệ.' });
    }
    if (path === '/auth/login') return json(401, { message: 'Email hoặc mật khẩu không đúng.' });
    return refreshed ? json(200, { path }) : json(401, { message: 'Vui lòng đăng nhập để tiếp tục.' });
  });
  vi.stubGlobal('fetch', fetchMock);
  const refreshCalls = () => fetchMock.mock.calls.filter(([url]) => new URL(url).pathname === '/auth/refresh').length;
  return { fetchMock, refreshCalls };
}

describe('request — tự refresh khi 401', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('401 thì refresh rồi gửi lại và thành công', async () => {
    const { refreshCalls } = stubServer();
    await expect(request('/users')).resolves.toEqual({ path: '/users' });
    expect(refreshCalls()).toBe(1);
  });

  it('nhiều request cùng 401 chỉ refresh một lần', async () => {
    const { refreshCalls } = stubServer();
    const results = await Promise.all([request('/users'), request('/auth/me'), request('/profiles/me')]);
    expect(results).toEqual([{ path: '/users' }, { path: '/auth/me' }, { path: '/profiles/me' }]);
    expect(refreshCalls()).toBe(1);
  });

  it('refresh thất bại thì báo hết phiên và ném lỗi 401', async () => {
    stubServer({ refreshStatus: 401 });
    const listener = vi.fn();
    const off = onAuthEvent(listener);
    await expect(request('/users')).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledWith('expired', expect.any(String));
    off();
  });

  it('401 ở /auth/login không refresh và giữ nguyên thông báo', async () => {
    const { refreshCalls } = stubServer();
    const error = await request('/auth/login', { method: 'POST', body: '{}' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).message).toBe('Email hoặc mật khẩu không đúng.');
    expect(refreshCalls()).toBe(0);
  });
});
