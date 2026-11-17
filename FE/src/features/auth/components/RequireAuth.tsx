import { Navigate, Outlet, useLocation } from 'react-router';
import { AppLoader } from '../../../components/feedback/AppLoader';
import { useAuth } from '../model/useAuth';

/**
 * Bọc các trang cần đăng nhập. Khách bị chuyển về /login, kèm địa chỉ đang muốn vào để quay lại sau.
 * Hồ sơ chưa có trường + ngành thì phải qua /onboarding trước (trang hồ sơ vẫn vào được).
 */
export function RequireAuth() {
  const { user, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) return <AppLoader />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  const { pathname } = location;
  if (!user.profileCompleted && pathname !== '/onboarding' && !pathname.startsWith('/profile')) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
