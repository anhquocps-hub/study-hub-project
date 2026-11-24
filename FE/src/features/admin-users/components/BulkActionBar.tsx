import { INERT_PROPS } from '../../../shared/ui';
import styles from './UserDirectory.module.css';

/** Thanh thao tác hàng loạt, hiện khi có hàng được chọn. 3 nút BE chưa hỗ trợ nên bấm không có gì xảy ra. */
export function BulkActionBar({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <div className={styles.bulkBar} role="region" aria-label="Thao tác hàng loạt">
      <p className={styles.bulkInfo}>
        <span className={styles.bulkCount}>Đã chọn: {count} tài khoản</span>
        <span aria-hidden="true">|</span>
        <span>Thao tác nhanh cho hàng loạt:</span>
      </p>
      <div className={styles.bulkActions}>
        <button type="button" className={styles.bulkButton} {...INERT_PROPS}>
          Gửi cảnh báo
        </button>
        <button type="button" className={styles.bulkButton} {...INERT_PROPS}>
          Xác thực thẻ SV
        </button>
        <button type="button" className={`${styles.bulkButton} ${styles.bulkDanger}`} {...INERT_PROPS}>
          Khóa tạm thời
        </button>
      </div>
    </div>
  );
}
