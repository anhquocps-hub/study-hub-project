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

  it('không còn tài khoản demo mang tên Study Hub', async () => {
    await expect(authApi.login({ email: 'demo@studyhub.vn', password: MOCK_DEMO_PASSWORD })).rejects.toMatchObject({
      status: 401,
    });
  });
});
