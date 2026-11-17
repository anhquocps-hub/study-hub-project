import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import {
  Alert,
  Button,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconSchool,
  IconSearch,
  SelectField,
  Skeleton,
} from '../../../shared/ui';
import { academicApi } from '../api';
import { useMajors } from '../hooks/useMajors';
import { useSubjects } from '../hooks/useSubjects';
import { useUniversities } from '../hooks/useUniversities';
import {
  academicFormSchema,
  MAX_SUBJECTS,
  type AcademicFormValues,
  type MyAcademic,
} from '../model/academic-schemas';
import styles from './AcademicOnboardingForm.module.css';

/** Các ô mà BE có thể trả lỗi riêng (fieldErrors). */
const SERVER_FIELDS = ['universityId', 'majorId', 'subjectIds'] as const;

/** Bỏ dấu tiếng Việt để tìm "co so du lieu" vẫn ra "Cơ sở dữ liệu". */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/gi, 'd').toLowerCase();

interface AcademicOnboardingFormProps {
  initial: MyAcademic;
  /** Gọi sau khi lưu thành công (cập nhật người dùng, chuyển trang). */
  onSaved: () => Promise<void>;
}

/** Chọn Trường → Ngành → Môn đang học. Đổi trường thì xóa ngành và môn; đổi ngành thì xóa môn. */
export function AcademicOnboardingForm({ initial, onSaved }: AcademicOnboardingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AcademicFormValues>({
    resolver: zodResolver(academicFormSchema),
    defaultValues: {
      universityId: initial.universityId ?? '',
      majorId: initial.majorId ?? '',
      subjectIds: initial.subjectIds,
    },
  });
  const universityId = useWatch({ control, name: 'universityId' });
  const majorId = useWatch({ control, name: 'majorId' });
  const { state: universities, retry: retryUniversities } = useUniversities();
  const { state: majors, retry: retryMajors } = useMajors(universityId);
  const { state: subjects, retry: retrySubjects } = useSubjects(universityId, majorId);
  const [query, setQuery] = useState('');

  const universityOptions =
    universities.status === 'success' ? universities.data.map((item) => ({ value: item.id, label: item.name })) : [];
  const majorOptions = majors.status === 'success' ? majors.data.map((item) => ({ value: item.id, label: item.name })) : [];
  const majorPlaceholder = !universityId
    ? 'Chọn trường trước'
    : majors.status === 'loading'
      ? 'Đang tải danh sách ngành…'
      : 'Chọn ngành đang học…';

  const save = handleSubmit(async (values) => {
    try {
      await academicApi.saveMyAcademic(values);
      await onSaved();
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

  const retryButton = (onRetry: () => void) => (
    <button type="button" className={styles.linkBtn} onClick={onRetry}>
      Thử lại
    </button>
  );

  return (
    <form className={styles.form} onSubmit={save} noValidate>
      {errors.root?.server && <Alert>{errors.root.server.message}</Alert>}

      <div className={styles.row}>
        <SelectField
          label="Trường đại học"
          required
          placeholder={universities.status === 'loading' ? 'Đang tải danh sách trường…' : 'Chọn trường theo học…'}
          options={universityOptions}
          leadingIcon={<IconSchool />}
          labelAside={universities.status === 'error' && retryButton(retryUniversities)}
          error={errors.universityId?.message ?? (universities.status === 'error' ? 'Không tải được danh sách trường.' : undefined)}
          value={universityId}
          {...register('universityId', {
            onChange: () => {
              setValue('majorId', '');
              setValue('subjectIds', []);
            },
          })}
        />
        <SelectField
          label="Ngành học"
          required
          disabled={!universityId || majors.status !== 'success'}
          placeholder={majorPlaceholder}
          options={majorOptions}
          leadingIcon={<IconBook />}
          labelAside={majors.status === 'error' && retryButton(retryMajors)}
          error={errors.majorId?.message ?? (majors.status === 'error' ? 'Không tải được danh sách ngành.' : undefined)}
          value={majorId}
          {...register('majorId', { onChange: () => setValue('subjectIds', []) })}
        />
      </div>

      <Controller
        control={control}
        name="subjectIds"
        render={({ field }) => {
          const selected = new Set(field.value);
          const isFull = selected.size >= MAX_SUBJECTS;
          // Đọc giá trị mới nhất thay vì field.value, để bấm nhanh liên tiếp không mất lựa chọn
          const toggle = (id: string) => {
            const current = getValues('subjectIds');
            field.onChange(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
          };
          const list = subjects.status === 'success' ? subjects.data : [];
          const keyword = normalize(query.trim());
          const visible = keyword
            ? list.filter((subject) => normalize(`${subject.code} ${subject.name}`).includes(keyword))
            : list;

          return (
            <fieldset className={styles.subjects} aria-describedby="subjects-hint">
              <legend className={styles.subjectsHead}>
                <span className={styles.subjectsTitle}>
                  Môn học kỳ này <span className={styles.optional}>(tùy chọn)</span>
                </span>
                {selected.size > 0 && (
                  <span className={styles.counter}>
                    Đã chọn {selected.size}/{MAX_SUBJECTS}
                    <button type="button" className={styles.linkBtn} onClick={() => field.onChange([])}>
                      Bỏ chọn
                    </button>
                  </span>
                )}
              </legend>
              <p id="subjects-hint" className={styles.hint}>
                Dùng để gợi ý nhóm học, cộng đồng môn học và bài viết liên quan.
              </p>

              {!majorId ? (
                <p className={styles.placeholder}>Chọn trường và ngành để xem danh sách môn học.</p>
              ) : subjects.status === 'loading' ? (
                <div className={styles.grid} role="status" aria-label="Đang tải danh sách môn">
                  {[0, 1, 2, 3].map((key) => (
                    <Skeleton key={key} height="56px" />
                  ))}
                </div>
              ) : subjects.status === 'error' ? (
                <p className={styles.placeholder} role="alert">
                  Không tải được danh sách môn. {retryButton(retrySubjects)}
                </p>
              ) : list.length === 0 ? (
                <p className={styles.placeholder}>Ngành này chưa có danh sách môn. Bạn có thể bỏ qua bước này.</p>
              ) : (
                <>
                  <label className={styles.search}>
                    <IconSearch size={16} />
                    <input
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Tìm tên hoặc mã môn (vd: IT204)"
                      aria-label="Tìm môn học"
                    />
                  </label>
                  {visible.length === 0 ? (
                    <p className={styles.placeholder}>Không có môn nào khớp “{query.trim()}”.</p>
                  ) : (
                    <ul className={styles.grid}>
                      {visible.map((subject) => {
                        const isSelected = selected.has(subject.id);
                        return (
                          <li key={subject.id}>
                            <button
                              type="button"
                              className={isSelected ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                              aria-pressed={isSelected}
                              disabled={!isSelected && isFull}
                              onClick={() => toggle(subject.id)}
                            >
                              <span className={styles.chipText}>
                                <span className={styles.chipCode}>
                                  {subject.code} • {subject.credits} TC
                                </span>
                                <span className={styles.chipName}>{subject.name}</span>
                              </span>
                              <span className={styles.check} aria-hidden="true">
                                {isSelected && <IconCheck size={16} />}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {isFull && <p className={styles.hint}>Đã đủ {MAX_SUBJECTS} môn. Bỏ chọn một môn để chọn môn khác.</p>}
                </>
              )}
              {errors.subjectIds && (
                <p className={styles.error} role="alert">
                  {errors.subjectIds.message}
                </p>
              )}
            </fieldset>
          );
        }}
      />

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Đang lưu…"
        trailingIcon={<IconArrowRight />}
      >
        Hoàn tất &amp; vào UniSpace
      </Button>
    </form>
  );
}

/** Khung chờ cùng kích thước với form, tránh nhảy bố cục khi dữ liệu về. */
export function AcademicOnboardingSkeleton() {
  return (
    <div className={styles.form} role="status" aria-label="Đang tải hồ sơ học thuật">
      <div className={styles.row}>
        <Skeleton height="66px" />
        <Skeleton height="66px" />
      </div>
      <Skeleton height="180px" />
      <Skeleton height="52px" />
    </div>
  );
}
