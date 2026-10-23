import { Link } from 'react-router';
import { AuthLayout, RegisterForm } from '../features/auth';
import { IconLogIn } from '../shared/ui';

export function RegisterPage() {
  return (
    <AuthLayout
      width="wide"
      eyebrow="Tài khoản sinh viên"
      title="Tạo tài khoản Study Hub mới"
      description="Gia nhập mạng lưới học thuật và kết nối đồng đội dự án sinh viên liên trường."
      footer={
        <>
          <span>Đã có tài khoản Study Hub?</span>
          <Link to="/login">
            Đăng nhập ngay <IconLogIn size={16} />
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
