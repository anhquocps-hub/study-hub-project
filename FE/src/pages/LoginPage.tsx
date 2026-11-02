import { Link } from 'react-router';
import { AuthLayout, LoginForm } from '../features/auth';
import { IconArrowRight } from '../shared/ui';
import styles from './AuthPage.module.css';

const isMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Cổng truy cập sinh viên"
      title="Đăng nhập tài khoản"
      description="Dùng email trường hoặc email cá nhân bạn đã đăng ký."
      footer={
        <>
          <span>Chưa có tài khoản Study Hub?</span>
          <Link to="/register">
            Đăng ký ngay <IconArrowRight size={16} />
          </Link>
        </>
      }
    >
      {isMockApi && (
        <p className={styles.mockNote}>Chế độ mock: đăng nhập bằng demo@studyhub.vn / demo1234</p>
      )}
      <LoginForm />
    </AuthLayout>
  );
}
