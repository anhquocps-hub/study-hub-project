import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_DEMO_PASSWORD, mockDb } from '../../../test/mock-db';
import * as authApi from '../api/auth-api.mock';

describe('mock auth (UniSpace)', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
  });

  it('đăng nhập được bằng tài khoản demo UniSpace', async () => {
    const user = await authApi.login({ email: 'demo@unispace.vn', password: MOCK_DEMO_PASSWORD });
    expect(user.email).toBe('demo@unispace.vn');
  });

  it('admin demo đăng nhập được với quyền ADMIN', async () => {
    const user = await authApi.login({ email: 'admin@unispace.vn', password: MOCK_DEMO_PASSWORD });
    expect(user.role).toBe('ADMIN');
  });

  it('tài khoản bị khóa không đăng nhập được', async () => {
    mockDb.updateAccount('u-demo', { status: 'BANNED' });
    await expect(authApi.login({ email: 'demo@unispace.vn', password: MOCK_DEMO_PASSWORD })).rejects.toMatchObject({
      status: 403,
      message: 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn.',
    });
  });

  it('không còn tài khoản demo mang tên Study Hub', async () => {
    await expect(authApi.login({ email: 'demo@studyhub.vn', password: MOCK_DEMO_PASSWORD })).rejects.toMatchObject({
      status: 401,
    });
  });
});
