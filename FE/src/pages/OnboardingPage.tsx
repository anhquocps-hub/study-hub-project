import { useNavigate } from 'react-router';
import { AcademicOnboardingForm, AcademicOnboardingSkeleton, useMyAcademic } from '../features/academic';
import { AuthLayout, useAuth } from '../features/auth';
import { ErrorState } from '../shared/ui';
import styles from './OnboardingPage.module.css';

/** Bước sau đăng ký: chọn trường, ngành và các môn đang học. Hồ sơ đủ trường + ngành mới vào được app. */
export function OnboardingPage() {
  const { refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const { state, retry } = useMyAcademic();

  const finish = async () => {
    await refreshUser(); // BE trả profileCompleted = true
    await navigate('/', { replace: true });
  };

  return (
    <AuthLayout
      width="wide"
      eyebrow="Hồ sơ học thuật"
      title="Bạn đang học ở đâu?"
      description="Chọn trường và ngành để UniSpace gợi ý cộng đồng, bài viết và đồng đội phù hợp với bạn. Có thể đổi lại trong Hồ sơ cá nhân."
      footer={
        <>
          <span>Không phải tài khoản của bạn?</span>
          <button type="button" className={styles.logout} onClick={() => void logout()}>
            Đăng xuất
          </button>
        </>
      }
    >
      {state.status === 'loading' && <AcademicOnboardingSkeleton />}
      {state.status === 'error' && (
        <ErrorState title="Không tải được hồ sơ học thuật" message={state.message} onRetry={retry} />
      )}
      {state.status === 'success' && <AcademicOnboardingForm initial={state.data} onSaved={finish} />}
    </AuthLayout>
  );
}
