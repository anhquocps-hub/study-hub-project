import { createBrowserRouter } from 'react-router';
import { GuestOnly, RequireAuth } from '../../features/auth';
import { EditProfilePage } from '../../pages/EditProfilePage';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { MyProfilePage } from '../../pages/MyProfilePage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { UserProfilePage } from '../../pages/UserProfilePage';

export const router = createBrowserRouter([
  {
    // Trang cho khách: đã đăng nhập thì GuestOnly tự chuyển đi.
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    // Trang cần đăng nhập: khách bị RequireAuth chuyển về /login.
    // Khi xong App Layout, bọc nhóm này bằng layout có Header và Sidebar.
    element: <RequireAuth />,
    children: [
      { path: '/', element: <HomePage /> }, // Feed của chu kỳ 2 sẽ thay vào
      { path: '/profile/me', element: <MyProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/users/:userId', element: <UserProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
