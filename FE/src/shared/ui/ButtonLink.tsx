import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import styles from './Button.module.css';

interface ButtonLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  leadingIcon?: ReactNode;
}

/** Liên kết chuyển trang trông như nút (ví dụ "Chỉnh sửa hồ sơ"); dùng <a> thật để mở được tab mới. */
export function ButtonLink({ variant = 'primary', size = 'md', leadingIcon, className, children, ...props }: ButtonLinkProps) {
  const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
  return (
    <Link className={classNames} {...props}>
      {leadingIcon}
      {children}
    </Link>
  );
}
