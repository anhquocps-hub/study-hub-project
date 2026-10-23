import styles from './AppLoader.module.css';

/** Màn hình chờ toàn trang, dùng khi đang khôi phục phiên đăng nhập. */
export function AppLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Đang tải…</span>
    </div>
  );
}
