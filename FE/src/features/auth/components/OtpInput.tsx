import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import styles from './OtpInput.module.css';

interface OtpInputProps {
  /** Chỉ gồm chữ số, dài tối đa `length`. */
  value: string;
  onChange: (next: string) => void;
  length?: number;
  disabled?: boolean;
  /** Có lỗi thì viền các ô chuyển sang màu báo lỗi. */
  error?: string;
}

/**
 * Ô nhập mã OTP gồm nhiều ô một chữ số (Figma 38:2080).
 * - Gõ số thì tự nhảy sang ô kế; chữ cái bị bỏ qua.
 * - Backspace ở ô trống thì lùi về ô trước và xóa ô đó.
 * - Dán vào ô nào cũng lấy các chữ số trong chuỗi, điền từ ô đầu, tối đa `length` số.
 */
export function OtpInput({ value, onChange, length = 6, disabled = false, error }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusAt = (index: number) => inputsRef.current[Math.max(0, Math.min(length - 1, index))]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };

  const handleInput = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    // Ô trước còn trống thì điền vào vị trí trống đầu tiên, để chuỗi không bị "thủng".
    const target = Math.min(index, value.length);
    setDigit(target, digit);
    focusAt(target + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focusAt(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      focusAt(index - 1);
    } else if (event.key === 'ArrowRight') {
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(pasted.length);
  };

  return (
    <div className={styles.group} role="group" aria-label="Mã OTP">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          className={`${styles.digit} ${error ? styles.invalid : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={2} // cho phép gõ đè: giữ chữ số vừa gõ (ký tự cuối)
          aria-label={`Chữ số thứ ${index + 1}`}
          aria-invalid={error ? true : undefined}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
}
