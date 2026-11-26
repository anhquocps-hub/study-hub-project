import { createBrowserRouter, Navigate } from 'react-router';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AppLayout } from '../../components/layout/AppLayout';
import { GuestOnly, RequireAdmin, RequireAuth } from '../../features/auth';
import { ChatRoomPage } from '../../pages/ChatRoomPage';
import { EditProfilePage } from '../../pages/EditProfilePage';
import { FeedPage } from '../../pages/FeedPage';
import { ForgotPasswordPage } from '../../pages/ForgotPasswordPage';
import { LoginPage } from '../../pages/LoginPage';
import { MyProfilePage } from '../../pages/MyProfilePage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { PostDetailPage } from '../../pages/PostDetailPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { UserProfilePage } from '../../pages/UserProfilePage';

export const router = createBrowserRouter([
  {
    // Trang cho khách: đã đăng nhập thì GuestOnly tự chuyển đi.
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    // Trang cần đăng nhập: khách bị RequireAuth chuyển về /login.
    element: <RequireAuth />,
    children: [
      {
        // Khung có Header + thanh điều hướng trái (Figma).
        element: <AppLayout />,
        children: [
          { path: '/', element: <FeedPage /> },
          { path: '/posts/:postId', element: <PostDetailPage /> },
          { path: '/spaces/:roomId', element: <ChatRoomPage kind="SPACE" /> },
          { path: '/communities/:roomId', element: <ChatRoomPage kind="COMMUNITY" /> },
        ],
      },
      {
        // Trang chỉ dành cho ADMIN: người dùng thường thấy trang 403.
        element: <RequireAdmin />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin', element: <Navigate to="/admin/users" replace /> },
              { path: '/admin/users', element: <UserManagementPage /> },
            ],
          },
        ],
      },
      { path: '/profile/me', element: <MyProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/users/:userId', element: <UserProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
