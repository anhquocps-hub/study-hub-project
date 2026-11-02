import { useContext } from 'react';
import { AuthContext } from './auth-context';

/** Lấy người dùng hiện tại và các hàm login/register/logout. Chỉ dùng bên trong AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
}
