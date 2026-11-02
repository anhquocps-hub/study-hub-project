import type { ComponentProps, ReactNode } from 'react';
import styles from './Field.module.css';
import { FieldShell } from './FieldShell';
import { useFieldIds } from './use-field-ids';

interface TextAreaProps extends ComponentProps<'textarea'> {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Nội dung nhỏ bên phải nhãn, ví dụ bộ đếm "120 / 500". */
  labelAside?: ReactNode;
}

/** Ô nhập nhiều dòng, cùng khung nhãn/gợi ý/lỗi với TextField. */
export function TextArea({ label, error, hint, labelAside, id, required, className, rows = 5, ...textareaProps }: TextAreaProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds(id, Boolean(hint), Boolean(error));

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
      <textarea
        id={inputId}
        rows={rows}
        className={[styles.input, styles.textarea, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...textareaProps}
      />
    </FieldShell>
  );
}
