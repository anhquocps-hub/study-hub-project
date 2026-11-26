/**
 * Cầu nối khi auth gọi BE thật nhưng bảng tin / chat vẫn chạy mock (xem shared/lib/api-mode.ts).
 * Mock của các feature đó đọc người dùng hiện tại từ mockDb.session, nên mỗi lần auth thật trả về người dùng
 * (đăng nhập, đăng ký, khôi phục phiên) thì tạo tài khoản mock tương ứng và mở phiên mock cho người đó;
 * đăng xuất hoặc hết phiên thì đóng phiên mock.
 */
import type { LoginInput, RegisterInput, User } from '../features/auth/model/auth-schemas';
import { mockDb } from './mock-db';

interface BridgeableAuthApi {
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  getMe: () => Promise<User | null>;
}

function syncSession(user: User | null) {
  if (user) {
    mockDb.ensureAccount(user);
    mockDb.session.start(user.id);
  } else {
    mockDb.session.end();
  }
  return user;
}

export function withMockSessionBridge<T extends BridgeableAuthApi>(api: T): T {
  return {
    ...api,
    login: async (input: LoginInput) => syncSession(await api.login(input)) as User,
    register: async (input: RegisterInput) => syncSession(await api.register(input)) as User,
    getMe: async () => syncSession(await api.getMe()),
    logout: async () => {
      try {
        await api.logout();
      } finally {
        mockDb.session.end();
      }
    },
  };
}
