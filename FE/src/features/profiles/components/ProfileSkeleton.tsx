import { Skeleton } from '../../../shared/ui';
import styles from './ProfileView.module.css';

/** Khung giữ chỗ trong lúc tải hồ sơ, cùng bố cục với ProfileView để trang không bị nhảy. */
export function ProfileSkeleton() {
  return (
    <div className={styles.view} role="status" aria-label="Đang tải hồ sơ">
      <div className={styles.hero}>
        <div className={styles.cover} aria-hidden="true" />
        <div className={styles.identity}>
          <div className={styles.avatarWrap}>
            <Skeleton className={styles.skeletonAvatar} />
          </div>
          <div className={styles.identityText}>
            <Skeleton width="60%" height="32px" />
            <Skeleton width="40%" />
          </div>
        </div>
        <Skeleton height="64px" />
      </div>
      <div className={styles.columns}>
        <div className={styles.column}>
          <Skeleton height="180px" />
          <Skeleton height="120px" />
        </div>
        <div className={styles.column}>
          <Skeleton height="220px" />
          <Skeleton height="140px" />
        </div>
      </div>
    </div>
  );
}
