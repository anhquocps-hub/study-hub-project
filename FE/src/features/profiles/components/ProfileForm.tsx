import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useController, useForm, useWatch } from 'react-hook-form';
import { useMajors, useUniversities } from '../../academic';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import {
  Alert,
  Button,
  Card,
  IconBriefcase,
  IconCode,
  IconGlobe,
  IconHash,
  IconHeart,
  IconIdCard,
  IconLink,
  IconLock,
  IconPencil,
  IconSchool,
  IconZap,
  SelectField,
  TextArea,
  TextField,
} from '../../../shared/ui';
import { useSaveProfile } from '../hooks/useSaveProfile';
import {
  MAX_BIO_LENGTH,
  MAX_INTERESTS,
  MAX_SKILLS,
  profileFormSchema,
  SERVER_FIELD_TO_FORM_FIELD,
  toFormValues,
  type ProfileFormValues,
} from '../model/profile-form';
import type { Profile } from '../model/profile-schemas';
import { InterestsEditor } from './InterestsEditor';
import { ProfileCompletion } from './ProfileCompletion';
import styles from './ProfileForm.module.css';
import { SkillsEditor } from './SkillsEditor';
import { UnsavedChangesBar } from './UnsavedChangesBar';

interface ProfileFormProps {
  profile: Profile;
  /** Email đăng nhập, chỉ hiển thị. */
  email: string;
  /** true khi hồ sơ chưa đủ trường và ngành (thường là vừa đăng ký xong). */
  isOnboarding: boolean;
}

export function ProfileForm({ profile, email, isOnboarding }: ProfileFormProps) {
  const saveProfile = useSaveProfile();
  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onTouched',
    defaultValues: toFormValues(profile),
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  // Ô chọn trường và ngành dùng dạng có kiểm soát (value) để hiện đúng lựa chọn khi danh sách tải xong sau form
  const { field: universityField } = useController({ control, name: 'universityId' });
  const { field: majorField } = useController({ control, name: 'majorId' });
  const [bio, skills, interests] = useWatch({ control, name: ['bio', 'skills', 'interests'] });

  const { state: universities, retry: retryUniversities } = useUniversities();
  const { state: majors, retry: retryMajors } = useMajors(universityField.value);

  // Cảnh báo khi đóng tab hoặc tải lại trang lúc còn thay đổi chưa lưu
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const universityOptions =
    universities.status === 'success' ? universities.data.map((item) => ({ value: item.id, label: item.name })) : [];
  const majorOptions = majors.status === 'success' ? majors.data.map((item) => ({ value: item.id, label: item.name })) : [];
  const majorPlaceholder =
    universityField.value === ''
      ? 'Chọn trường trước'
      : majors.status === 'loading'
        ? 'Đang tải danh sách ngành…'
        : 'Chọn ngành…';

  const handleSave = handleSubmit(async (values) => {
    try {
      await saveProfile(values);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setError('root.server', { message: GENERIC_ERROR });
        return;
      }
      let hasFieldError = false;
      for (const [serverField, message] of Object.entries(error.fieldErrors)) {
        const formField = SERVER_FIELD_TO_FORM_FIELD[serverField];
        if (formField) {
          setError(formField, { message }, { shouldFocus: !hasFieldError });
          hasFieldError = true;
        }
      }
      if (!hasFieldError) setError('root.server', { message: error.message });
    }
  });

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={handleSave} noValidate>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Cập nhật hồ sơ cá nhân</h1>
            <p className={styles.description}>
              Thông tin này hiển thị khi bạn đăng bài tìm nhóm hoặc gửi yêu cầu tham gia một nhóm.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" onClick={() => reset()} disabled={!isDirty || isSubmitting}>
              Hủy thay đổi
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Đang lưu…" disabled={!isDirty}>
              Lưu
            </Button>
          </div>
        </header>

        {isOnboarding && (
          <p className={styles.onboarding}>
            Chọn trường và ngành học để hoàn thiện hồ sơ. Sau đó bạn có thể đăng bài tìm nhóm và được người khác tìm thấy.
          </p>
        )}

        <ProfileCompletion />

        {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}

        <div className={styles.columns}>
          <div className={styles.column}>
            <Card title="Thông tin cơ bản" icon={<IconIdCard />}>
              <div className={styles.fields}>
                <TextField
                  label="Họ và tên đầy đủ"
                  autoComplete="name"
                  required
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <TextField
                  label="Email"
                  value={email}
                  readOnly
                  leadingIcon={<IconLock />}
                  hint="Email dùng để đăng nhập, không thay đổi ở đây."
                />
              </div>
            </Card>

            <Card title="Thông tin học tập" icon={<IconSchool />}>
              <div className={styles.fields}>
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
                  error={
                    errors.universityId?.message ??
                    (universities.status === 'error' ? 'Không tải được danh sách trường.' : undefined)
                  }
                  {...universityField}
                  onChange={(event) => {
                    universityField.onChange(event);
                    setValue('majorId', '', { shouldDirty: true }); // đổi trường thì phải chọn lại ngành
                  }}
                />
                <SelectField
                  label="Ngành học"
                  required
                  placeholder={majorPlaceholder}
                  options={majorOptions}
                  labelAside={
                    majors.status === 'error' && (
                      <button type="button" className={styles.retry} onClick={retryMajors}>
                        Thử lại
                      </button>
                    )
                  }
                  error={
                    errors.majorId?.message ?? (majors.status === 'error' ? 'Không tải được danh sách ngành.' : undefined)
                  }
                  {...majorField}
                />
                <div className={styles.row}>
                  <TextField label="Khóa" placeholder="vd: K21" error={errors.cohort?.message} {...register('cohort')} />
                  <TextField
                    label="Mã số SV (tùy chọn)"
                    placeholder="vd: 21110034"
                    leadingIcon={<IconHash />}
                    error={errors.studentId?.message}
                    {...register('studentId')}
                  />
                </div>
              </div>
            </Card>

            <Card title="Liên kết" icon={<IconLink />} aside="Hiển thị công khai">
              <div className={styles.fields}>
                <TextField
                  label="GitHub"
                  type="url"
                  inputMode="url"
                  placeholder="https://github.com/ten-cua-ban"
                  leadingIcon={<IconCode />}
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                />
                <TextField
                  label="LinkedIn"
                  type="url"
                  inputMode="url"
                  placeholder="https://linkedin.com/in/ten-cua-ban"
                  leadingIcon={<IconBriefcase />}
                  error={errors.linkedinUrl?.message}
                  {...register('linkedinUrl')}
                />
                <TextField
                  label="Portfolio"
                  type="url"
                  inputMode="url"
                  placeholder="https://ten-cua-ban.dev"
                  leadingIcon={<IconGlobe />}
                  error={errors.portfolioUrl?.message}
                  {...register('portfolioUrl')}
                />
              </div>
            </Card>
          </div>

          <div className={styles.column}>
            <Card title="Giới thiệu bản thân" icon={<IconPencil />}>
              <TextArea
                label="Giới thiệu"
                placeholder="Bạn đang học gì, mạnh về mảng nào, đang tìm nhóm cho môn hay project nào…"
                rows={6}
                labelAside={
                  <span className={bio.length > MAX_BIO_LENGTH ? `${styles.counter} ${styles.counterOver}` : styles.counter}>
                    {bio.length} / {MAX_BIO_LENGTH}
                  </span>
                }
                error={errors.bio?.message}
                {...register('bio')}
              />
            </Card>

            <Card title="Kỹ năng chuyên môn" icon={<IconZap />} aside={`${skills.length}/${MAX_SKILLS}`}>
              <SkillsEditor />
            </Card>

            <Card title="Sở thích" icon={<IconHeart />} aside={`${interests.length}/${MAX_INTERESTS}`}>
              <InterestsEditor />
            </Card>
          </div>
        </div>

        <UnsavedChangesBar isVisible={isDirty} isSaving={isSubmitting} onDiscard={() => reset()} />
      </form>
    </FormProvider>
  );
}
