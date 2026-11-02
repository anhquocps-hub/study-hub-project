import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useUniversities } from '../../academic';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import {
  Alert,
  Button,
  Checkbox,
  IconArrowRight,
  IconHash,
  IconIdCard,
  IconLock,
  IconMail,
  IconSchool,
  IconShieldCheck,
  PasswordField,
  SelectField,
  TextField,
} from '../../../shared/ui';
import { registerSchema, type RegisterInput } from '../model/auth-schemas';
import { useAuth } from '../model/useAuth';
import styles from './AuthForm.module.css';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

/** Các ô mà BE có thể trả lỗi riêng (fieldErrors) để hiện ngay dưới ô đó. */
const SERVER_FIELDS = ['fullName', 'email', 'universityId', 'studentId', 'password'] as const;

export function RegisterForm() {
  // Đổi tên để không trùng với register() của react-hook-form
  const { register: registerAccount } = useAuth();
  const { state: universities, retry: retryUniversities } = useUniversities();
  const {
    register,
    control,
    handleSubmit,
    setError,
    trigger,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      fullName: '',
      email: '',
      universityId: '',
      studentId: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });
  const password = useWatch({ control, name: 'password' });

  const universityOptions =
    universities.status === 'success'
      ? universities.data.map((university) => ({ value: university.id, label: university.name }))
      : [];
  const universityError =
    errors.universityId?.message ??
    (universities.status === 'error' ? 'Không tải được danh sách trường.' : undefined);

  const handleRegister = handleSubmit(async (values) => {
    try {
      await registerAccount(values); // thành công → GuestOnly đưa sang /profile/edit để thêm ngành học
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setError('root.server', { message: GENERIC_ERROR });
        return;
      }
      let hasFieldError = false;
      for (const name of SERVER_FIELDS) {
        const message = error.fieldErrors[name];
        if (message) {
          setError(name, { message }, { shouldFocus: !hasFieldError });
          hasFieldError = true;
        }
      }
      if (!hasFieldError) setError('root.server', { message: error.message });
    }
  });

  return (
    <form className={styles.form} onSubmit={handleRegister} noValidate>
      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}

      <TextField
        label="Họ và tên đầy đủ"
        autoComplete="name"
        placeholder="vd: Nguyễn Minh Tuấn"
        required
        leadingIcon={<IconIdCard />}
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <TextField
        label="Email trường / Email cá nhân"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="mssv@student.edu.vn hoặc email cá nhân"
        required
        labelAside={<span className={styles.labelNote}>Khuyên dùng email .edu.vn</span>}
        leadingIcon={<IconMail />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div className={`${styles.row} ${styles.rowUniversity}`}>
        <SelectField
          label="Trường đại học"
          required
          placeholder={universities.status === 'loading' ? 'Đang tải danh sách trường…' : 'Chọn trường theo học…'}
          options={universityOptions}
          leadingIcon={<IconSchool />}
          labelAside={
            universities.status === 'error' && (
              <button type="button" className={styles.retry} onClick={retryUniversities}>
                Thử lại
              </button>
            )
          }
          error={universityError}
          {...register('universityId')}
        />
        <TextField
          label="Mã số SV (tùy chọn)"
          autoComplete="off"
          placeholder="vd: 21110034"
          leadingIcon={<IconHash />}
          error={errors.studentId?.message}
          {...register('studentId')}
        />
      </div>

      <div className={`${styles.row} ${styles.rowPassword}`}>
        <PasswordField
          label="Mật khẩu"
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          required
          leadingIcon={<IconLock />}
          error={errors.password?.message}
          {...register('password', {
            // Đổi mật khẩu sau khi đã nhập ô xác nhận thì kiểm tra lại ô xác nhận
            onChange: () => {
              if (touchedFields.confirmPassword) void trigger('confirmPassword');
            },
          })}
        />
        <PasswordField
          label="Xác nhận mật khẩu"
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          required
          leadingIcon={<IconShieldCheck />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <PasswordStrengthMeter password={password} />

      <Checkbox error={errors.acceptTerms?.message} {...register('acceptTerms')}>
        Tôi đồng ý với <strong>Điều khoản dịch vụ</strong> và <strong>Tiêu chuẩn cộng đồng</strong> của Study Hub.
      </Checkbox>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Đang tạo tài khoản…"
        trailingIcon={<IconArrowRight />}
      >
        Tạo tài khoản
      </Button>
    </form>
  );
}
