import { Link } from 'react-router';
import { useAuth } from '../features/auth';
import { ProfileForm, ProfileFormSkeleton, useProfile } from '../features/profiles';
import { ErrorState, IconArrowLeft } from '../shared/ui';
import styles from './ProfilePage.module.css';

export function EditProfilePage() {
  const { user } = useAuth();
  const { state, retry } = useProfile('me');

  return (
    <main className={styles.page}>
      <Link to="/profile/me" className={styles.back}>
        <IconArrowLeft size={16} /> Hồ sơ của tôi
      </Link>
      {state.status === 'loading' && <ProfileFormSkeleton />}
      {state.status === 'error' && <ErrorState title="Không tải được hồ sơ" message={state.message} onRetry={retry} />}
      {state.status === 'success' && (
        <ProfileForm profile={state.data} email={user?.email ?? ''} isOnboarding={!user?.profileCompleted} />
      )}
    </main>
  );
}
