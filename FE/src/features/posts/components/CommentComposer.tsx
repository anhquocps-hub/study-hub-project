import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { getErrorMessage } from '../../../services/http-client';
import { Avatar } from '../../../shared/ui';
import { COMMENT_MAX_LENGTH, commentFormSchema } from '../model/comment-schemas';
import styles from './Comments.module.css';

interface CommentComposerProps {
  /** Tên truy cập của ô nhập, ví dụ "Viết bình luận", "Trả lời Mai". */
  label: string;
  placeholder?: string;
  /** Tên truy cập của nút gửi; có submitIcon thì nút chỉ hiện icon. */
  submitLabel: string;
  submitIcon?: string;
  initialValue?: string;
  autoFocus?: boolean;
  /** Ảnh đại diện người đang viết (bỏ trống khi sửa bình luận). */
  viewer?: { fullName: string; avatarUrl: string | null };
  onSubmit: (content: string) => Promise<void>;
  /** Có thì hiện nút "Hủy" (sửa bình luận, trả lời). */
  onCancel?: () => void;
}

/** Ô viết bình luận/phản hồi: Enter để gửi, Shift+Enter xuống dòng; lỗi thì giữ nguyên nội dung. */
export function CommentComposer({
  label,
  placeholder,
  submitLabel,
  submitIcon,
  initialValue = '',
  autoFocus = false,
  viewer,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const errorId = useId();
  const canSubmit = content.trim() !== '' && !isSubmitting;

  useEffect(() => {
    if (!autoFocus) return;
    const input = inputRef.current;
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }, [autoFocus]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;
    const parsed = commentFormSchema.safeParse({ content });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? null);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(parsed.data.content);
      setContent('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    } else if (event.key === 'Escape' && onCancel && !isSubmitting) {
      event.preventDefault();
      onCancel();
    }
  };

  const nearLimit = content.length > COMMENT_MAX_LENGTH * 0.9;

  return (
    <form className={styles.composer} onSubmit={submit} noValidate>
      {viewer && <Avatar name={viewer.fullName} src={viewer.avatarUrl} className={styles.composerAvatar} />}
      <div className={styles.composerBody}>
        <div className={styles.composerBox}>
          <textarea
            ref={inputRef}
            className={styles.composerInput}
            value={content}
            rows={1}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder={placeholder}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            readOnly={isSubmitting} // giữ focus trong ô nhập khi đang gửi
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {submitIcon ? (
            <button type="submit" className={styles.sendBtn} aria-label={submitLabel} aria-disabled={!canSubmit}>
              <img src={submitIcon} alt="" />
            </button>
          ) : null}
        </div>
        <div className={styles.composerFooter}>
          {error ? (
            <p id={errorId} className={styles.error} role="alert">
              {error}
            </p>
          ) : (
            <span className={styles.hint} aria-live="polite">{nearLimit ? `${content.length} / ${COMMENT_MAX_LENGTH}` : ''}</span>
          )}
          {(onCancel || !submitIcon) && (
            <span className={styles.composerActions}>
              {onCancel && (
                <button type="button" className={styles.linkBtn} onClick={onCancel} disabled={isSubmitting}>
                  Hủy
                </button>
              )}
              {!submitIcon && (
                <button type="submit" className={`${styles.linkBtn} ${styles.linkBtnPrimary}`} aria-disabled={!canSubmit}>
                  {isSubmitting ? 'Đang lưu…' : submitLabel}
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
