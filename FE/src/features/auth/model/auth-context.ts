import { createContext } from 'react';
import type { LoginInput, RegisterInput, User } from './auth-schemas';

export interface AuthContextValue {
  /** Người đang đăng nhập; null nếu là khách. */
  user: User | null;
  /** true trong lúc mở trang và đang hỏi BE về danh tính; guard chờ xong mới quyết định chuyển trang. */
  isRestoring: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Hỏi lại BE thông tin người dùng, ví dụ sau khi lưu hồ sơ để cập nhật profileCompleted. */
  refreshUser: () => Promise<void>;
  /** Lý do bị đăng xuất ngoài ý muốn (hết phiên, bị khóa) để trang Đăng nhập hiển thị; null nếu không có. */
  sessionNotice: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
