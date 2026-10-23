import { Link, Navigate, useParams } from 'react-router';
import { useAuth } from '../features/auth';
import { ProfileSkeleton, ProfileView, useProfile } from '../features/profiles';
import { ButtonLink, ErrorState, IconArrowLeft, IconUserSearch } from '../shared/ui';
import styles from './ProfilePage.module.css';

export function UserProfilePage() {
  const { userId = '' } = useParams();
  const { user } = useAuth();
  const { state, retry } = useProfile(userId);

  // Mở hồ sơ của chính mình qua /users/:id thì chuyển về /profile/me để có nút chỉnh sửa
  if (user && userId === user.id) return <Navigate to="/profile/me" replace />;

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        <IconArrowLeft size={16} /> Trang chủ
      </Link>
      {state.status === 'loading' && <ProfileSkeleton />}
      {state.status === 'error' &&
        (state.httpStatus === 404 ? (
          <ErrorState
            icon={<IconUserSearch size={24} />}
            title="Không tìm thấy người dùng"
            message="Tài khoản này không tồn tại hoặc đường dẫn đã bị thay đổi."
            action={
              <ButtonLink to="/" variant="secondary">
                Về trang chủ
              </ButtonLink>
            }
          />
        ) : (
          <ErrorState title="Không tải được hồ sơ" message={state.message} onRetry={retry} />
        ))}
      {state.status === 'success' && <ProfileView profile={state.data} isOwner={false} />}
    </main>
  );
}
