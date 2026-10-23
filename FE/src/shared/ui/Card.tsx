import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  /** Icon trang trí trước tiêu đề. */
  icon?: ReactNode;
  /** Nội dung nhỏ bên phải tiêu đề, ví dụ số lượng. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Thẻ nội dung có tiêu đề (header → content), dùng cho các khối trong trang. */
export function Card({ title, icon, aside, children, className }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title}
        </h2>
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      {children}
    </section>
  );
}
