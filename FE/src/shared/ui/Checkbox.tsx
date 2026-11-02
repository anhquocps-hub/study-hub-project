import type { ComponentProps, ReactNode } from 'react';
import styles from './Checkbox.module.css';
import { IconAlertCircle, IconCheck } from './Icon';
import { useFieldIds } from './use-field-ids';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'children'> {
  children: ReactNode;
  error?: string;
}

/** Ô tích có nhãn bấm được; dùng thẻ checkbox gốc (ẩn đi) để giữ hỗ trợ bàn phím và trình đọc màn hình. */
export function Checkbox({ children, error, id, ...inputProps }: CheckboxProps) {
  const { inputId, errorId, describedBy } = useFieldIds(id, false, Boolean(error));

  return (
    <div className={styles.wrapper}>
      <label htmlFor={inputId} className={styles.label}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <span className={styles.box}>
          <IconCheck size={16} />
        </span>
        <span>{children}</span>
      </label>
      {error && (
        <p id={errorId} className={styles.error}>
          <IconAlertCircle size={16} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
