import type { ReactNode } from 'react';
import styles from './ProfileView.module.css';

/** Trạng thái rỗng của một khối hồ sơ: nói rõ vì sao rỗng và (nếu có) việc nên làm tiếp. */
export function SectionEmpty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p>{children}</p>
      {action}
    </div>
  );
}
