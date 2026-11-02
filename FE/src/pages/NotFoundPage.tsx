import { Link } from 'react-router';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Không tìm thấy trang</h1>
      <p className={styles.note}>Đường dẫn không tồn tại hoặc đã bị thay đổi.</p>
      <Link to="/">Về trang chủ</Link>
    </main>
  );
}
