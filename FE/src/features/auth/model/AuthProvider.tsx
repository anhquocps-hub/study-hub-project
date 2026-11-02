import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api';
import { AuthContext } from './auth-context';
import type { LoginInput, RegisterInput, User } from './auth-schemas';

/**
 * Giữ người dùng hiện tại cho toàn bộ app.
 * Khi mở trang, gọi getMe() để khôi phục phiên đăng nhập từ cookie (hoặc sessionStorage khi dùng mock),
 * nhờ vậy F5 không bị đăng xuất.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let isActive = true; // tránh cập nhật state nếu component đã bị gỡ trước khi getMe() trả về
    authApi
      .getMe()
      .then((me) => {
        if (isActive) setUser(me);
      })
      .catch(() => {
        if (isActive) setUser(null); // BE lỗi hoặc mất mạng: coi như khách
      })
      .finally(() => {
        if (isActive) setIsRestoring(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setUser(await authApi.login(input));
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setUser(await authApi.register(input));
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authApi.getMe());
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, login, register, logout, refreshUser }),
    [user, isRestoring, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
