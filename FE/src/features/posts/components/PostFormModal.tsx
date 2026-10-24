import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import iconAttach from '../../../assets/figma/modal-attach.svg';
import iconBookOpen from '../../../assets/figma/modal-book-open.svg';
import iconBook from '../../../assets/figma/modal-book.svg';
import iconCalendar from '../../../assets/figma/modal-calendar.svg';
import iconCap from '../../../assets/figma/modal-cap.svg';
import iconCaretPurple from '../../../assets/figma/modal-caret-purple.svg';
import iconCaret from '../../../assets/figma/modal-caret.svg';
import iconClose from '../../../assets/figma/modal-close.svg';
import iconEmoji from '../../../assets/figma/modal-emoji.svg';
import iconGlobe from '../../../assets/figma/modal-globe.svg';
import iconHash from '../../../assets/figma/modal-hash.svg';
import iconImage from '../../../assets/figma/modal-image.svg';
import iconSchool from '../../../assets/figma/modal-school.svg';
import iconTagPlus from '../../../assets/figma/modal-tag-plus.svg';
import iconType from '../../../assets/figma/modal-type.svg';
import iconUserPlus from '../../../assets/figma/modal-user-plus.svg';
import iconUser from '../../../assets/figma/modal-user.svg';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import { Avatar } from '../../../shared/ui';
import {
  COURSE_REQUIRED_TYPES,
  normalizeTag,
  POST_TYPE_LABELS,
  postFormSchema,
  postTypeSchema,
  type Post,
  type PostFormInput,
  type PostInput,
} from '../model/post-schemas';
import styles from './PostFormModal.module.css';

interface PostFormModalProps {
  /** Có bài = chế độ sửa; null = tạo mới. */
  post: Post | null;
  author: { fullName: string; avatarUrl: string | null; university: string | null; universityName: string | null };
  onSubmit: (input: PostInput) => Promise<void>;
  onClose: () => void;
}

const TAG_TONES = ['accent', 'accent', 'green', 'purple'] as const;

function toFormValues(post: Post | null): PostFormInput {
  return {
    type: post?.type ?? 'FIND_TEAMMATE',
    content: post?.content ?? '',
    tags: post?.tags ?? [],
    subject: post?.course?.subject ?? '',
    classCode: post?.course?.classCode ?? '',
    semester: post?.course?.semester ?? '',
    lecturer: post?.course?.lecturer ?? '',
  };
}

const ADD_TOOLS = [
  { icon: iconImage, label: 'Ảnh' },
  { icon: iconUserPlus, label: 'Gắn thẻ bạn bè' },
  { icon: iconBookOpen, label: 'Tài liệu môn học' },
  { icon: iconEmoji, label: 'Cảm xúc' },
  { icon: iconAttach, label: 'Tệp đính kèm' },
];

/** Popup "Tạo bài viết", dùng chung cho tạo và sửa. */
export function PostFormModal({ post, author, onSubmit, onClose }: PostFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tagDraft, setTagDraft] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostFormInput, unknown, PostInput>({
    resolver: zodResolver(postFormSchema),
    defaultValues: toFormValues(post),
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal(); // modal thật: khóa nền, Esc để đóng, focus nằm trong popup
    return () => dialog?.close();
  }, []);

  const courseRequired = COURSE_REQUIRED_TYPES.includes(watch('type'));

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [field, message] of Object.entries(error.fieldErrors))
          setError(field as keyof PostFormInput, { message });
        setFormError(error.message);
      } else setFormError(GENERIC_ERROR);
    }
  });

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="post-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!isSubmitting) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !isSubmitting) onClose(); // bấm ra nền tối để đóng
      }}
    >
      <form className={styles.panel} onSubmit={submit} noValidate>
        <header className={styles.header}>
          <h2 id="post-form-title" className={styles.title}>
            {post ? 'Sửa bài viết' : 'Tạo bài viết'}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng popup" disabled={isSubmitting}>
            <img src={iconClose} alt="" />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.author}>
            <span className={styles.avatarWrap}>
              <Avatar name={author.fullName} src={author.avatarUrl} className={styles.avatar} />
              <span className={styles.online} aria-hidden="true" />
            </span>
            <div className={styles.authorInfo}>
              <p className={styles.authorName}>
                {author.fullName}
                {author.university && <span>({author.university})</span>}
              </p>
              <div className={styles.pills}>
                <span className={styles.pill}>
                  <img src={iconGlobe} alt="" />
                  Công khai
                  <img src={iconCaret} alt="" />
                </span>
                <label className={`${styles.pill} ${styles.pillType}`}>
                  <img src={iconType} alt="" />
                  <select {...register('type')} aria-label="Loại bài viết">
                    {postTypeSchema.options.map((type) => (
                      <option key={type} value={type}>
                        {POST_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                  <img src={iconCaretPurple} alt="" />
                </label>
              </div>
            </div>
          </div>

          <div className={styles.statusBlock}>
            <textarea
              className={styles.status}
              placeholder={`${author.fullName} ơi, bạn đang tìm teammate hay cần lập nhóm học?`}
              aria-label="Nội dung bài viết"
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={errors.content ? 'content-error' : undefined}
              {...register('content')}
            />
            {errors.content && (
              <p id="content-error" className={styles.fieldError}>
                {errors.content.message}
              </p>
            )}
            <Controller
              control={control}
              name="tags"
              render={({ field }) => {
                const addTag = () => {
                  const tag = tagDraft ? normalizeTag(tagDraft) : null;
                  if (tag && !field.value.includes(tag)) field.onChange([...field.value, tag]);
                  setTagDraft(null);
                };
                const onTagKey = (event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addTag();
                  } else if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    setTagDraft(null);
                  }
                };
                return (
                  <ul className={styles.tags} aria-label="Tag">
                    {field.value.map((tag, index) => (
                      <li key={tag}>
                        <button
                          type="button"
                          className={`${styles.tag} ${styles[TAG_TONES[index % TAG_TONES.length]]}`}
                          onClick={() => field.onChange(field.value.filter((item) => item !== tag))}
                          aria-label={`Bỏ tag ${tag}`}
                          title="Bấm để bỏ tag"
                        >
                          #{tag}
                        </button>
                      </li>
                    ))}
                    <li>
                      {tagDraft === null ? (
                        <button type="button" className={styles.addTag} onClick={() => setTagDraft('')}>
                          <img src={iconTagPlus} alt="" />
                          Tag
                        </button>
                      ) : (
                        <input
                          className={styles.tagInput}
                          autoFocus
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          onKeyDown={onTagKey}
                          onBlur={addTag}
                          placeholder="vd: React"
                          aria-label="Tag mới, Enter để thêm"
                        />
                      )}
                    </li>
                  </ul>
                );
              }}
            />
            {errors.tags && <p className={styles.fieldError}>{errors.tags.message}</p>}
          </div>

          <fieldset className={styles.academic}>
            <legend className={styles.academicHead}>
              <span className={styles.academicTitle}>
                <img src={iconCap} alt="" />
                Thông tin học thuật &amp; Học phần
              </span>
              <span className={styles.academicHint}>Hỗ trợ lọc &amp; ghép nhóm</span>
            </legend>

            <div className={styles.field}>
              <span className={styles.labelRow}>
                <span className={styles.label}>Trường đại học</span>
                <span className={styles.labelGreen}>Mặc định theo hồ sơ</span>
              </span>
              <span className={styles.inputWrap}>
                <img src={iconSchool} alt="" className={styles.inputIcon} />
                <input className={styles.input} value={author.universityName ?? 'Chưa cập nhật trong hồ sơ'} readOnly aria-label="Trường đại học" />
              </span>
            </div>

            <div className={styles.grid}>
              <label className={styles.field}>
                <span className={styles.label}>
                  Môn học {courseRequired && <span className={styles.required}>*</span>}
                </span>
                <span className={styles.inputWrap}>
                  <img src={iconBook} alt="" className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    placeholder="vd: Cơ sở dữ liệu"
                    aria-invalid={errors.subject ? true : undefined}
                    {...register('subject')}
                  />
                </span>
                {errors.subject && <span className={styles.fieldError}>{errors.subject.message}</span>}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>
                  Lớp học phần / Mã lớp {courseRequired && <span className={styles.required}>*</span>}
                </span>
                <span className={styles.inputWrap}>
                  <img src={iconHash} alt="" className={styles.inputIcon} />
                  <input
                    className={styles.input}
                    placeholder="vd: SE402.N02"
                    aria-invalid={errors.classCode ? true : undefined}
                    {...register('classCode')}
                  />
                </span>
                {errors.classCode && <span className={styles.fieldError}>{errors.classCode.message}</span>}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Học kỳ &amp; Niên khóa</span>
                <span className={styles.inputWrap}>
                  <img src={iconCalendar} alt="" className={styles.inputIcon} />
                  <input className={styles.input} placeholder="vd: HK2 (2026 - 2027)" {...register('semester')} />
                </span>
                {errors.semester && <span className={styles.fieldError}>{errors.semester.message}</span>}
              </label>
              <label className={styles.field}>
                <span className={styles.label}>
                  Giảng viên phụ trách <span className={styles.optional}>(tùy chọn)</span>
                </span>
                <span className={styles.inputWrap}>
                  <img src={iconUser} alt="" className={styles.inputIcon} />
                  <input className={styles.input} placeholder="vd: TS. Nguyễn Thanh Hải" {...register('lecturer')} />
                </span>
                {errors.lecturer && <span className={styles.fieldError}>{errors.lecturer.message}</span>}
              </label>
            </div>
          </fieldset>

          <div className={styles.addBar}>
            <span className={styles.addTitle}>Thêm vào bài viết của bạn</span>
            <span className={styles.addTools}>
              {ADD_TOOLS.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  className={styles.addTool}
                  aria-label={`${tool.label} (sắp có)`}
                  title={`${tool.label} (sắp có)`}
                >
                  <img src={tool.icon} alt="" />
                </button>
              ))}
            </span>
          </div>

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu…' : post ? 'Lưu thay đổi' : 'Đăng'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
