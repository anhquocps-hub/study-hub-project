import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  /** Ghi rõ hành động, ví dụ "Xóa bài viết" — không dùng "OK". */
  confirmLabel: string;
  /** Đang thực hiện: khóa nút và không cho đóng bằng Esc. */
  isBusy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Đánh dấu vùng nhận focus khi phần tử mở hộp thoại bị gỡ (ví dụ đã xóa bình luận). Vùng cần tabIndex={-1}. */
export const FOCUS_FALLBACK_ATTR = 'data-focus-fallback';

/**
 * Hộp thoại xác nhận hành động phá hủy (design.md §7.4).
 * Dùng <dialog> native: khóa nền và giữ focus bên trong; focus mặc định vào "Hủy".
 * Đóng thì trả focus về phần tử đã mở; nếu phần tử đó đã bị gỡ khỏi trang thì focus vào
 * vùng tổ tiên gần nhất có thuộc tính data-focus-fallback.
 */
export function ConfirmDialog({ title, message, confirmLabel, isBusy = false, error, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const fallback = opener?.parentElement?.closest<HTMLElement>(`[${FOCUS_FALLBACK_ATTR}]`) ?? null;
    const dialog = dialogRef.current;
    dialog?.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog?.close();
      if (opener?.isConnected) opener.focus();
      else if (fallback?.isConnected) fallback.focus();
    };
  }, []);

  // Đang xử lý thì các nút bị khóa: giữ focus ở hộp thoại thay vì rơi về <body>.
  useEffect(() => {
    if (isBusy) dialogRef.current?.focus();
  }, [isBusy]);

  return (
    <dialog
      ref={dialogRef}
      role="alertdialog"
      tabIndex={-1}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        event.preventDefault(); // để React quyết định việc đóng (theo isBusy)
        if (!isBusy) onCancel();
      }}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p id={messageId} className={styles.message}>
        {message}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={isBusy}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isBusy}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
