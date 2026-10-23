import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ProfileSkeleton, ProfileView, useProfile } from '../features/profiles';
import { ErrorState, IconArrowLeft } from '../shared/ui';
import styles from './ProfilePage.module.css';

export function MyProfilePage() {
  const { state, retry } = useProfile('me');
  const location = useLocation();
  const navigate = useNavigate();
  // Vừa lưu ở trang sửa hồ sơ thì hiện thông báo; xóa cờ khỏi lịch sử để F5 không hiện lại
  const [isJustSaved] = useState(() => (location.state as { profileSaved?: unknown } | null)?.profileSaved === true);

  useEffect(() => {
    if (isJustSaved) void navigate(location.pathname, { replace: true, state: null });
  }, [isJustSaved, location.pathname, navigate]);

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        <IconArrowLeft size={16} /> Trang chủ
      </Link>
      {state.status === 'loading' && <ProfileSkeleton />}
      {state.status === 'error' && <ErrorState title="Không tải được hồ sơ" message={state.message} onRetry={retry} />}
      {isJustSaved && state.status === 'success' && (
        <p role="status" className={styles.saved}>
          Đã lưu hồ sơ.
        </p>
      )}
      {state.status === 'success' && <ProfileView profile={state.data} isOwner />}
    </main>
  );
}
