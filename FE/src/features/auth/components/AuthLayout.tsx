import type { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  /** Nhãn nhỏ phía trên tiêu đề, ví dụ "Cổng truy cập sinh viên". */
  eyebrow: string;
  title: string;
  description: string;
  /** Hộp cuối thẻ, thường là liên kết sang trang Đăng nhập/Đăng ký. */
  footer: ReactNode;
  /** narrow cho form ngắn (Đăng nhập), wide cho form hai cột (Đăng ký). */
  width?: 'narrow' | 'wide';
  children: ReactNode;
}

/** Khung chung của trang Đăng nhập và Đăng ký theo Figma: nền tối, thẻ ở giữa màn hình. */
export function AuthLayout({ eyebrow, title, description, footer, width = 'narrow', children }: AuthLayoutProps) {
  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${styles[width]}`} aria-labelledby="auth-title">
        <header className={styles.header}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="auth-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </header>
        {children}
        <footer className={styles.footer}>{footer}</footer>
      </section>
    </main>
  );
}
