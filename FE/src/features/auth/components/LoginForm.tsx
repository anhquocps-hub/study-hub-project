import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import { Alert, Button, IconArrowRight, IconAt, IconLock, PasswordField, TextField } from '../../../shared/ui';
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
      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}

      <TextField
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="vd: 21110034@student.hcmute.edu.vn"
        required
        leadingIcon={<IconAt />}
        error={errors.email?.message}
        {...register('email')}
      />

      <PasswordField
        label="Mật khẩu"
        autoComplete="current-password"
        placeholder="Nhập mật khẩu"
        required
        leadingIcon={<IconLock />}
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Đang đăng nhập…"
        trailingIcon={<IconArrowRight />}
        className={styles.submit}
      >
        Đăng nhập vào Study Hub
      </Button>
    </form>
  );
}
