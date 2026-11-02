import { Skeleton } from '../../../shared/ui';
import styles from './ProfileForm.module.css';

/** Khung giữ chỗ trong lúc tải dữ liệu cho form sửa hồ sơ. */
export function ProfileFormSkeleton() {
  return (
    <div className={styles.form} role="status" aria-label="Đang tải hồ sơ">
      <Skeleton width="50%" height="32px" />
      <Skeleton height="56px" />
      <div className={styles.columns}>
        <div className={styles.column}>
          <Skeleton height="200px" />
          <Skeleton height="260px" />
        </div>
        <div className={styles.column}>
          <Skeleton height="200px" />
          <Skeleton height="220px" />
        </div>
      </div>
    </div>
  );
}
