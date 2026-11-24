import type { AdminUser, ModerationKind } from '../model/admin-user-schemas';
import styles from './UserDirectory.module.css';

const TONE: Record<ModerationKind, string> = {
  WARNING: styles.toneWarning,
  TEMP_BAN: styles.toneDanger,
  FLAGGED: styles.toneDanger,
  VERIFIED: styles.toneAccent,
  ACTIVE_POSITIVE: styles.toneSuccess,
};

/**
 * Trạng thái hiển thị của một người dùng.
 * `status` của BE luôn quyết định: BANNED → "Đã khóa" (bỏ qua nhãn kiểm duyệt), để khóa/mở khóa đổi ngay trên bảng.
 * ACTIVE → nhãn kiểm duyệt nếu có (dữ liệu mở rộng), không có thì "Đang hoạt động".
 */
export function UserStatusBadge({ user }: { user: Pick<AdminUser, 'status' | 'moderation'> }) {
  if (user.status === 'BANNED') {
    return (
      <span className={`${styles.status} ${styles.toneDanger}`}>
        <span className={styles.statusDot} aria-hidden="true" />
        Đã khóa
      </span>
    );
  }
  if (user.moderation) {
    return (
      <span className={styles.statusStack}>
        <span className={`${styles.status} ${TONE[user.moderation.kind]}`}>
          <span className={styles.statusDot} aria-hidden="true" />
          {user.moderation.label}
        </span>
        {user.moderation.detail && <span className={styles.statusDetail}>{user.moderation.detail}</span>}
      </span>
    );
  }
  return (
    <span className={`${styles.status} ${styles.toneSuccess}`}>
      <span className={styles.statusDot} aria-hidden="true" />
      Đang hoạt động
    </span>
  );
}
