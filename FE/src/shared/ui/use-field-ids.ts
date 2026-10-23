import { useId } from 'react';

/** Tạo id cho ô nhập, dòng gợi ý và dòng lỗi, và chuỗi aria-describedby nối chúng với ô nhập. */
export function useFieldIds(id: string | undefined, hasHint: boolean, hasError: boolean) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hasHint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;
  return { inputId, hintId, errorId, describedBy };
}
