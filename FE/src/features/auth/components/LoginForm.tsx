import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import {
  Alert,
  Button,
  Checkbox,
  IconArrowRight,
  IconAt,
  IconCheck,
  IconLock,
  IconSchool,
  INERT_PROPS,
  PasswordField,
  TextField,
} from '../../../shared/ui';
import { loginSchema, type LoginInput } from '../model/auth-schemas';
import { useAuth } from '../model/useAuth';
import styles from './AuthForm.module.css';

export function LoginForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched', // chỉ báo lỗi sau khi rời ô hoặc bấm gửi
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = handleSubmit(async (values) => {
    try {
      await login(values); // thành công → GuestOnly tự chuyển trang
    } catch (error) {
      setError('root.server', { message: error instanceof ApiError ? error.message : GENERIC_ERROR });
    }
  });

  return (
    <form className={styles.form} onSubmit={handleLogin} noValidate>
      {/* SSO trường: BE chưa hỗ trợ nên bấm vào không có gì xảy ra. */}
      <button type="button" className={styles.sso} {...INERT_PROPS}>
        <span className={styles.ssoIcon}>
          <IconSchool size={20} />
        </span>
        <span className={styles.ssoText}>
          <span className={styles.ssoTitle}>Đăng nhập bằng Email Sinh viên trường</span>
          <span className={styles.ssoSub}>SSO EduID • Office365 / Google Workspace Edu</span>
        </span>
        <span className={styles.ssoBadge}>
          <IconCheck size={16} />
          Khuyên dùng
        </span>
      </button>

      <p className={styles.divider}>
        <span>HOẶC TIẾP TỤC VỚI EMAIL</span>
      </p>

      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}

      <TextField
        label="Email sinh viên / Tài khoản"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="vd: 21110034@student.hcmute.edu.vn"
        required
        labelAside={<span className={styles.labelHint}>Hỗ trợ Edu Mail</span>}
        leadingIcon={<IconAt />}
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordField
        label="Mật khẩu"
        autoComplete="current-password"
        placeholder="Nhập mật khẩu"
        required
        labelAside={
          <Link to="/forgot-password" className={styles.forgotLink}>
            Quên mật khẩu?
          </Link>
        }
        leadingIcon={<IconLock />}
        error={errors.password?.message}
        {...register('password')}
      />

      {/* BE chưa hỗ trợ "ghi nhớ đăng nhập": ô luôn bỏ trống, bấm không đổi. */}
      <Checkbox checked={false} readOnly {...INERT_PROPS}>
        Ghi nhớ đăng nhập trên thiết bị này
      </Checkbox>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Đang đăng nhập…"
        trailingIcon={<IconArrowRight />}
        className={styles.submit}
      >
        Đăng nhập vào UniSpace
      </Button>
    </form>
  );
}
