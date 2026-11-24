import { Link } from 'react-router';
import styles from './NotFoundPage.module.css';

/** Trang 403: đã đăng nhập nhưng không đủ quyền (ví dụ người dùng thường vào trang Admin). */
export function ForbiddenPage() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>403</p>
      <h1 className={styles.title}>Bạn không có quyền truy cập trang này</h1>
      <p className={styles.note}>Trang này chỉ dành cho Quản trị viên UniSpace.</p>
      <Link to="/">Về bảng tin</Link>
    </main>
  );
}
