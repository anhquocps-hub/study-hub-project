import { Outlet } from 'react-router';
import { ForbiddenPage } from '../../../pages/ForbiddenPage';
import { useAuth } from '../model/useAuth';

/**
 * Bọc các trang chỉ dành cho ADMIN. Đặt bên trong RequireAuth (lúc này chắc chắn đã có người dùng).
 * Không đủ quyền thì hiện trang 403 tại chỗ thay vì chuyển hướng, để người dùng hiểu lý do.
 */
export function RequireAdmin() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Outlet /> : <ForbiddenPage />;
}
