import { describe, expect, it, vi } from 'vitest';
import type { User } from '../features/auth';
import { mockDb } from './mock-db';
import { withMockSessionBridge } from './mock-session-bridge';

const REAL_USER: User = {
  id: 'u-real',
  email: 'that@hcmute.edu.vn',
  fullName: 'Người Dùng Thật',
  role: 'USER',
  profileCompleted: true,
};

function fakeRealApi() {
  return {
    login: vi.fn().mockResolvedValue(REAL_USER),
    register: vi.fn().mockResolvedValue(REAL_USER),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn().mockResolvedValue(REAL_USER),
    requestPasswordReset: vi.fn().mockResolvedValue(undefined),
  };
}

describe('withMockSessionBridge', () => {
  it('đăng nhập thật thì phiên mock trỏ tới người dùng đó và có hồ sơ mock', async () => {
    const api = withMockSessionBridge(fakeRealApi());
    await api.login({ email: REAL_USER.email, password: 'x' });
    expect(mockDb.session.getUserId()).toBe('u-real');
    expect(mockDb.getProfile('u-real')?.fullName).toBe('Người Dùng Thật');
  });

  it('khôi phục phiên bằng getMe cũng đồng bộ phiên mock', async () => {
    const api = withMockSessionBridge(fakeRealApi());
    await api.getMe();
    expect(mockDb.session.getUserId()).toBe('u-real');
  });

  it('getMe trả null hoặc đăng xuất thì xóa phiên mock', async () => {
    const real = fakeRealApi();
    const api = withMockSessionBridge(real);
    await api.login({ email: REAL_USER.email, password: 'x' });
    await api.logout();
    expect(mockDb.session.getUserId()).toBeNull();

    await api.login({ email: REAL_USER.email, password: 'x' });
    real.getMe.mockResolvedValueOnce(null);
    await api.getMe();
    expect(mockDb.session.getUserId()).toBeNull();
  });

  it('gọi lại nhiều lần không tạo trùng tài khoản mock', async () => {
    const api = withMockSessionBridge(fakeRealApi());
    const before = mockDb.listAccounts().length;
    await api.login({ email: REAL_USER.email, password: 'x' });
    await api.getMe();
    expect(mockDb.listAccounts().length).toBe(before + 1);
  });
});
