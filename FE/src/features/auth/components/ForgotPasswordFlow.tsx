import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { getErrorMessage } from '../../../services/http-client';
import {
  Alert,
  Button,
  IconArrowLeft,
  IconArrowRight,
  IconMail,
  IconShieldCheck,
  INERT_PROPS,
  TextField,
} from '../../../shared/ui';
import { authApi } from '../api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../model/auth-schemas';
import { OtpInput } from './OtpInput';
import styles from './ForgotPasswordFlow.module.css';

/** Mã OTP có hiệu lực 5 phút (theo thiết kế). */
export const OTP_VALIDITY_SECONDS = 300;
/** Sau mỗi lần gửi mã phải chờ 60 giây mới được gửi lại. */
export const RESEND_COOLDOWN_SECONDS = 60;

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Đếm lùi từng giây từ `seconds`; đổi `resetKey` thì đếm lại từ đầu. */
function useCountdown(seconds: number, resetKey: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const left = Math.max(0, seconds - Math.floor((Date.now() - startedAt) / 1000));
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds, resetKey]);

  return remaining;
}

function EmailStep({ defaultEmail, onSent }: { defaultEmail: string; onSent: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: defaultEmail },
  });

  const submit = handleSubmit(async ({ email }) => {
    try {
      await authApi.requestPasswordReset(email);
      onSent(email);
    } catch (error) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  });

  return (
    <section className={`${styles.card} ${styles.cardNarrow}`} aria-labelledby="forgot-title">
      <header className={styles.header}>
        <div>
          <h1 id="forgot-title" className={styles.title}>
            Quên mật khẩu?
          </h1>
          <p className={styles.description}>
            Đừng lo lắng! Hãy nhập địa chỉ email trường hoặc email đã đăng ký của bạn. UniSpace sẽ gửi mã xác thực OTP
            6 số để bạn thiết lập lại mật khẩu mới.
          </p>
        </div>
        <span className={styles.emblem} aria-hidden="true">
          <IconShieldCheck size={24} />
        </span>
      </header>

      <div className={styles.methods}>
        <p className={styles.methodsLabel}>
          <span>PHƯƠNG THỨC KHÔI PHỤC</span>
          <span className={styles.methodsHint}>chọn kênh nhận otp</span>
        </p>
        <div className={styles.methodSwitch}>
          <button type="button" className={`${styles.method} ${styles.methodActive}`} aria-pressed="true">
            Email trường / Cá nhân
          </button>
          <button type="button" className={styles.method} aria-pressed="false" {...INERT_PROPS}>
            SĐT / Zalo Edu
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={submit} noValidate>
        {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}
        <TextField
          label="Địa chỉ email của bạn"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="vd: 21110034@student.hcmute.edu.vn"
          required
          labelAside={<span className={styles.recommended}>Khuyên dùng</span>}
          leadingIcon={<IconMail />}
          error={errors.email?.message}
          {...register('email')}
        />
        <p className={styles.note}>
          Mã OTP sẽ có hiệu lực trong 5 phút. Vui lòng kiểm tra cả hòm thư Spam nếu chưa nhận được.
        </p>
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          loadingText="Đang gửi mã…"
          trailingIcon={<IconArrowRight />}
        >
          Gửi mã xác thực OTP
        </Button>
      </form>

      <nav className={styles.links} aria-label="Điều hướng">
        <Link to="/login" className={styles.backLink}>
          <IconArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
        <span className={styles.helpLink} role="link" {...INERT_PROPS}>
          Cần trợ giúp từ Ban quản trị / IT Trường?
        </span>
      </nav>
    </section>
  );
}

function OtpStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const [otp, setOtp] = useState('');
  const [sendCount, setSendCount] = useState(0);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const validity = useCountdown(OTP_VALIDITY_SECONDS, sendCount);
  const cooldown = useCountdown(RESEND_COOLDOWN_SECONDS, sendCount);
  const isExpired = validity === 0;

  const resend = async () => {
    setIsResending(true);
    setResendError(null);
    try {
      await authApi.requestPasswordReset(email);
      setOtp('');
      setSendCount((count) => count + 1);
    } catch (error) {
      setResendError(getErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className={`${styles.card} ${styles.cardWide}`} aria-labelledby="otp-title">
      <span className={styles.strip} aria-hidden="true" />
      <header className={styles.header}>
        <div>
          <h1 id="otp-title" className={styles.title}>
            Xác thực mã bảo mật OTP
          </h1>
          <p className={styles.description}>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến địa chỉ email học thuật:{' '}
            <span className={styles.email}>{email}</span>{' '}
            <button type="button" className={styles.changeEmail} onClick={onChangeEmail}>
              (thay đổi email)
            </button>
          </p>
        </div>
        <span className={`${styles.emblem} ${styles.emblemRound}`} aria-hidden="true">
          <IconShieldCheck size={24} />
        </span>
      </header>

      <div className={styles.otpArea}>
        <OtpInput value={otp} onChange={setOtp} error={isExpired ? 'expired' : undefined} />
        <p className={styles.micro}>Mã OTP tự động nhận diện từ clipboard hệ thống</p>

        {isExpired && <Alert>Mã đã hết hạn, vui lòng gửi lại mã.</Alert>}
        {resendError && <Alert>{resendError}</Alert>}

        <div className={styles.timer}>
          <p className={styles.clock}>
            Mã có hiệu lực trong: <span className={styles.clockValue}>{formatClock(validity)}</span>
          </p>
          <p className={styles.resendRow}>
            <button
              type="button"
              className={styles.resend}
              disabled={cooldown > 0 || isResending}
              onClick={() => void resend()}
            >
              {cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : 'Gửi lại OTP'}
            </button>
            <span aria-hidden="true" className={styles.sep}>
              |
            </span>
            <button type="button" className={styles.smsLink} {...INERT_PROPS}>
              Kênh SMS
            </button>
          </p>
        </div>

        {/* BE chưa có API xác thực OTP: nút hiển thị đúng thiết kế nhưng bấm không có gì xảy ra. */}
        <Button size="lg" fullWidth trailingIcon={<IconArrowRight />} {...INERT_PROPS}>
          Xác nhận &amp; Tiếp tục
        </Button>
      </div>

      <footer className={styles.otpFooter}>
        <button type="button" className={styles.backButton} onClick={onChangeEmail}>
          <IconArrowLeft size={16} />
          Quay lại bước trước
        </button>
      </footer>
    </section>
  );
}

/**
 * Luồng Quên mật khẩu theo Figma: bước 1 nhập email (38:1935) → bước 2 nhập OTP (38:2080).
 * Bước giữ trong state của trang; F5 thì quay lại bước 1.
 */
export function ForgotPasswordFlow() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  return (
    <main className={styles.page}>
      {step === 'email' ? (
        <EmailStep
          defaultEmail={email}
          onSent={(sentTo) => {
            setEmail(sentTo);
            setStep('otp');
          }}
        />
      ) : (
        <OtpStep email={email} onChangeEmail={() => setStep('email')} />
      )}
    </main>
  );
}
