import { getPasswordStrength } from '../utils/password-strength';
import styles from './PasswordStrengthMeter.module.css';

/** Thanh 4 vạch báo độ mạnh mật khẩu theo Figma; mức độ luôn kèm chữ, không chỉ dựa vào màu. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);

  return (
    <div className={styles.meter} data-score={score}>
      <div className={styles.header}>
        <span>Độ an toàn mật khẩu:</span>
        <span className={styles.level} aria-live="polite">
          {label}
        </span>
      </div>
      <div className={styles.bars} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>
      <p className={styles.hint}>Nên có chữ in hoa, chữ số, ký tự đặc biệt (@, #, $) và tối thiểu 8 ký tự.</p>
    </div>
  );
}
