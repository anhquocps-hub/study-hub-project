import type { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'accent' | 'neutral' | 'success' | 'info';
  children: ReactNode;
}

/** Nhãn ngắn cho trạng thái hoặc metadata; luôn có chữ, không chỉ dựa vào màu. */
export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}
