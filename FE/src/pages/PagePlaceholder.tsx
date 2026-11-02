// TẠM THỜI - khung chung cho các trang chưa có giao diện thật
import type { ReactNode } from 'react';
import styles from './PagePlaceholder.module.css';

interface PagePlaceholderProps {
  title: string;
  note: string;
  children?: ReactNode;
}

export function PagePlaceholder({ title, note, children }: PagePlaceholderProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.note}>{note}</p>
        {children && <div className={styles.actions}>{children}</div>}
      </section>
    </main>
  );
}
