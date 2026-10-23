import { useState } from 'react';
import styles from './Field.module.css';
import { IconEye, IconEyeOff } from './Icon';
import { TextField, type TextFieldProps } from './TextField';

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;

/** Ô mật khẩu có nút hiện/ẩn ở cuối ô. */
export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={isVisible}
        >
          {isVisible ? <IconEyeOff /> : <IconEye />}
        </button>
      }
    />
  );
}
