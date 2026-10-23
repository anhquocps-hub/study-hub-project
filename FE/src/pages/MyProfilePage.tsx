import { Link } from 'react-router';
import { ProfileSkeleton, ProfileView, useProfile } from '../features/profiles';
import { ErrorState, IconArrowLeft } from '../shared/ui';
import styles from './ProfilePage.module.css';

export function MyProfilePage() {
  const { state, retry } = useProfile('me');

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        <IconArrowLeft size={16} /> Trang chủ
      </Link>
      {state.status === 'loading' && <ProfileSkeleton />}
      {state.status === 'error' && <ErrorState title="Không tải được hồ sơ" message={state.message} onRetry={retry} />}
      {state.status === 'success' && <ProfileView profile={state.data} isOwner />}
    </main>
  );
}
