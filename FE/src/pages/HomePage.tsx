// TẠM THỜI
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../features/auth';
import { PagePlaceholder } from './PagePlaceholder';

export function HomePage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout(); // xong → RequireAuth chuyển về /login
  };

  return (
    <PagePlaceholder title={`Xin chào, ${user?.fullName ?? ''}`} note="Feed sẽ được làm ở chu kỳ 2.">
      <Link to="/profile/me">Hồ sơ của tôi</Link>
      <Link to="/profile/edit">Sửa hồ sơ</Link>
      <Link to="/users/u-khac">Hồ sơ người khác</Link>
      <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
    </PagePlaceholder>
  );
}
