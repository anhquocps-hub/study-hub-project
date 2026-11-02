// Khung chung của một ô form: dòng nhãn (kèm ghi chú bên phải nếu có), ô nhập, dòng gợi ý, dòng lỗi.
// TextField và SelectField dùng chung khung này để mọi ô trông giống nhau.
import type { ReactNode } from 'react';
import styles from './Field.module.css';
import { IconAlertCircle } from './Icon';

interface FieldShellProps {
  inputId: string;
  hintId: string;
  errorId: string;
  label: string;
  required?: boolean;
  labelAside?: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ inputId, hintId, errorId, label, required, labelAside, hint, error, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAside}
      </div>
      {children}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <IconAlertCircle size={16} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
