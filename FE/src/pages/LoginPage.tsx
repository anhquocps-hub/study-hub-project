import { Link } from 'react-router';
import { AuthLayout, LoginForm } from '../features/auth';
import { IconArrowRight, IconShieldCheck } from '../shared/ui';
import styles from './AuthPage.module.css';

const isMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Cổng truy cập sinh viên"
      title="Đăng nhập tài khoản"
      description="Sử dụng email sinh viên (@student.edu.vn) hoặc tài khoản đã đăng ký."
      footer={
        <>
          <span>Chưa có tài khoản UniSpace?</span>
          <Link to="/register">
            Đăng ký ngay <IconArrowRight size={16} />
          </Link>
          <span className={styles.compliance}>
            <IconShieldCheck size={16} />
            Bảo mật theo tiêu chuẩn học thuật &amp; danh tính số Bộ GD&amp;ĐT
          </span>
        </>
      }
    >
      {isMockApi && (
        <p className={styles.mockNote}>Chế độ mock: demo@unispace.vn (sinh viên) hoặc admin@unispace.vn (quản trị), mật khẩu demo1234</p>
      )}
      <LoginForm />
    </AuthLayout>
  );
}
