import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../../components/layout/AppLayout';
import { GuestOnly, RequireAuth } from '../../features/auth';
import { ChatRoomPage } from '../../pages/ChatRoomPage';
import { CommunitiesPage } from '../../pages/CommunitiesPage';
import { CommunityPage } from '../../pages/CommunityPage';
import { EditProfilePage } from '../../pages/EditProfilePage';
import { FeedPage } from '../../pages/FeedPage';
import { LoginPage } from '../../pages/LoginPage';
import { MyProfilePage } from '../../pages/MyProfilePage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { SearchPage } from '../../pages/SearchPage';
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
    element: <RequireAuth />,
    children: [
      {
        // Khung có Header + thanh điều hướng trái (Figma).
        element: <AppLayout />,
        children: [
          { path: '/', element: <FeedPage /> },
          { path: '/spaces/:roomId', element: <ChatRoomPage kind="SPACE" /> },
          { path: '/search', element: <SearchPage /> },
          { path: '/communities', element: <CommunitiesPage /> },
          { path: '/communities/:roomId', element: <CommunityPage /> },
        ],
      },
      { path: '/profile/me', element: <MyProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/users/:userId', element: <UserProfilePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
