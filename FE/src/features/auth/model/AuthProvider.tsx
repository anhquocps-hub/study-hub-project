import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthEvent } from '../../../services/http-client';
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
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
    // Đã có người đăng nhập (đăng nhập, đăng ký, khôi phục phiên): lý do bị đăng xuất lần trước không còn đúng.
    if (user) setSessionNotice(null);
  }, [user]);

  // http-client báo hết phiên (refresh thất bại) hoặc tài khoản bị khóa: đăng xuất ở FE và giữ lý do cho trang
  // Đăng nhập.
  // - 'banned': luôn hiện lý do, kể cả lúc đang khôi phục phiên sau khi tải lại trang.
  // - 'expired': chỉ khi đang có người dùng; khách mở trang gặp 401 là bình thường, không cần thông báo.
  useEffect(
    () =>
      onAuthEvent((event, message) => {
        if (event === 'expired' && !userRef.current) return;
        setSessionNotice(message);
        setUser(null);
      }),
    [],
  );

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
    // Người dùng đã đọc lý do bị đăng xuất và thử lại: bỏ thông báo cũ, chỉ hiện kết quả lần này.
    setSessionNotice(null);
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
    () => ({ user, isRestoring, login, register, logout, refreshUser, sessionNotice }),
    [user, isRestoring, login, register, logout, refreshUser, sessionNotice],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
