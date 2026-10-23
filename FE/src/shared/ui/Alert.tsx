import type { ReactNode } from 'react';
import styles from './Alert.module.css';
import { IconAlertCircle } from './Icon';

/** Thông báo lỗi chung của cả form (không thuộc ô nào), được trình đọc màn hình đọc ngay khi xuất hiện. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className={styles.alert}>
      <IconAlertCircle />
      <div>{children}</div>
    </div>
  );
}
