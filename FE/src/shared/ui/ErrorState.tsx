import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './ErrorState.module.css';
import { IconAlertCircle } from './Icon';

interface ErrorStateProps {
  title: string;
  message: string;
  /** Có thì hiện nút "Thử lại". */
  onRetry?: () => void;
  /** Hành động khác, ví dụ liên kết về trang chủ. */
  action?: ReactNode;
  icon?: ReactNode;
}

/** Trạng thái lỗi: nói rõ chuyện gì xảy ra và cho người dùng cách đi tiếp. */
export function ErrorState({ title, message, onRetry, action, icon }: ErrorStateProps) {
  return (
    <div className={styles.state} role="alert">
      <span className={styles.icon}>{icon ?? <IconAlertCircle size={24} />}</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {(onRetry || action) && (
        <div className={styles.actions}>
          {onRetry && (
            <Button variant="secondary" onClick={onRetry}>
              Thử lại
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
