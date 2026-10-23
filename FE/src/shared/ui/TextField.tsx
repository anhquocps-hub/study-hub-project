import type { ComponentProps, ReactNode } from 'react';
import styles from './Field.module.css';
import { FieldShell } from './FieldShell';
import { useFieldIds } from './use-field-ids';

export interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Nội dung nhỏ bên phải nhãn, ví dụ "Khuyên dùng email .edu.vn". */
  labelAside?: ReactNode;
  /** Icon trang trí ở đầu ô nhập. */
  leadingIcon?: ReactNode;
  /** Phần tử ở cuối ô nhập, ví dụ nút hiện/ẩn mật khẩu. */
  trailing?: ReactNode;
}

/**
 * Ô nhập chữ có nhãn luôn hiển thị, lỗi nằm sát ô và được nối bằng aria-describedby.
 * React 19 nhận ref như prop thường, nên register() của react-hook-form gắn thẳng vào được.
 */
export function TextField({
  label,
  error,
  hint,
  labelAside,
  leadingIcon,
  trailing,
  id,
  required,
  className,
  ...inputProps
}: TextFieldProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds(id, Boolean(hint), Boolean(error));
  const inputClassName = [
    styles.input,
    leadingIcon && styles.hasLeading,
    trailing && styles.hasTrailing,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <FieldShell
      inputId={inputId}
      hintId={hintId}
      errorId={errorId}
      label={label}
      required={required}
      labelAside={labelAside}
      hint={hint}
      error={error}
    >
      <div className={styles.control}>
        {leadingIcon && <span className={styles.leading}>{leadingIcon}</span>}
        <input
          id={inputId}
          className={inputClassName}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...inputProps}
        />
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
    </FieldShell>
  );
}
