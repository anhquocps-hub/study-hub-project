import type { ComponentProps, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
  /** Đang chờ xử lý: khóa nút, hiện vòng quay và loadingText (nếu có). */
  isLoading?: boolean;
  loadingText?: string;
  /** Icon sau chữ, ví dụ mũi tên ở nút "Đăng nhập". */
  trailingIcon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loadingText,
  trailingIcon,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classNames = [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} disabled={disabled || isLoading} aria-busy={isLoading || undefined} {...props}>
      {isLoading ? (
        <>
          <span className={styles.spinner} aria-hidden="true" />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {children}
          {trailingIcon}
        </>
      )}
    </button>
  );
}
