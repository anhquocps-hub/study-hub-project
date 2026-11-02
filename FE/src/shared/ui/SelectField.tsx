import type { ComponentProps, ReactNode } from 'react';
import styles from './Field.module.css';
import { FieldShell } from './FieldShell';
import { IconChevronDown } from './Icon';
import { useFieldIds } from './use-field-ids';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends ComponentProps<'select'> {
  label: string;
  options: SelectOption[];
  /** Dòng hiển thị khi chưa chọn gì, ví dụ "Chọn trường theo học…". */
  placeholder?: string;
  error?: string;
  hint?: ReactNode;
  labelAside?: ReactNode;
  leadingIcon?: ReactNode;
}

/** Ô chọn dùng thẻ <select> gốc của trình duyệt để giữ đủ hỗ trợ bàn phím và trình đọc màn hình. */
export function SelectField({
  label,
  options,
  placeholder,
  error,
  hint,
  labelAside,
  leadingIcon,
  id,
  required,
  className,
  ...selectProps
}: SelectFieldProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds(id, Boolean(hint), Boolean(error));
  const selectClassName = [styles.input, styles.select, leadingIcon && styles.hasLeading, className]
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
        <select
          id={inputId}
          className={selectClassName}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...selectProps}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={`${styles.trailing} ${styles.chevron}`}>
          <IconChevronDown />
        </span>
      </div>
    </FieldShell>
  );
}
