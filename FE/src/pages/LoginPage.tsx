// TẠM THỜI
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../features/auth';
import { ApiError, GENERIC_ERROR } from '../services/http-client';
import { PagePlaceholder } from './PagePlaceholder';
import styles from './PagePlaceholder.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login({ email: 'demo@studyhub.vn', password: 'demo1234' }); // thành công → GuestOnly tự chuyển trang
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : GENERIC_ERROR);
      setIsLoading(false);
    }
  };

  return (
    <PagePlaceholder title="Đăng nhập" note="Form đăng nhập thật sẽ có ở bước 5.">
      <button type="button" onClick={handleDemoLogin} disabled={isLoading}>
        {isLoading ? 'Đang đăng nhập…' : 'Đăng nhập bằng tài khoản demo'}
      </button>
      <Link to="/register">Sang trang Đăng ký</Link>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </PagePlaceholder>
  );
}
