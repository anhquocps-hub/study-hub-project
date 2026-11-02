import { Navigate, Outlet, useLocation } from 'react-router';
import { AppLoader } from '../../../components/feedback/AppLoader';
import { useAuth } from '../model/useAuth';

/** Chỉ nhận đường dẫn nội bộ, tránh bị chuyển sang trang web khác. */
function getSafeRedirect(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/';
}

/**
 * Bọc trang Đăng nhập và Đăng ký. Khi đã có người dùng (vừa đăng nhập/đăng ký xong, hoặc mở lại trang
 * lúc còn phiên), tự chuyển đi:
 * - hồ sơ chưa đủ trường và ngành → /profile/edit
 * - hồ sơ đã đủ → trang người dùng định vào trước đó, mặc định là trang chủ.
 * Nhờ vậy form không phải tự gọi navigate().
 */
export function GuestOnly() {
  const { user, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <AppLoader />;
  if (user) {
    return <Navigate to={user.profileCompleted ? getSafeRedirect(location.state) : '/profile/edit'} replace />;
  }
  return <Outlet />;
}
