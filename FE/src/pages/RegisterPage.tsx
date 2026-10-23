// TẠM THỜI
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../features/auth';
import { ApiError, GENERIC_ERROR } from '../services/http-client';
import { PagePlaceholder } from './PagePlaceholder';
import styles from './PagePlaceholder.module.css';

export function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickRegister = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await register({
        fullName: 'Sinh viên Thử',
        email: `thu-${Date.now()}@studyhub.vn`,
        universityId: 'uit',
        studentId: '',
        password: 'abc12345',
        confirmPassword: 'abc12345',
        acceptTerms: true,
      }); // thành công → GuestOnly đưa sang /profile/edit vì hồ sơ chưa có ngành
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : GENERIC_ERROR);
      setIsLoading(false);
    }
  };

  return (
    <PagePlaceholder title="Đăng ký" note="Form đăng ký thật sẽ có ở bước 5.">
      <button type="button" onClick={handleQuickRegister} disabled={isLoading}>
        {isLoading ? 'Đang tạo tài khoản…' : 'Tạo nhanh tài khoản thử'}
      </button>
      <Link to="/login">Sang trang Đăng nhập</Link>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </PagePlaceholder>
  );
}
