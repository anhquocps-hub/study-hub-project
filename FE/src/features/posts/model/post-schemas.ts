import { z } from 'zod';

/** Loại bài viết theo PRD mục 13. */
export const postTypeSchema = z.enum(['GENERAL', 'FIND_TEAMMATE', 'FIND_PROJECT', 'FIND_STUDY_GROUP', 'QUESTION']);
export type PostType = z.infer<typeof postTypeSchema>;

export const POST_TYPE_LABELS: Record<PostType, string> = {
  GENERAL: 'Bài viết thường',
  FIND_TEAMMATE: 'Tìm đồng đội / Project',
  FIND_PROJECT: 'Tìm project để tham gia',
  FIND_STUDY_GROUP: 'Tìm nhóm học',
  QUESTION: 'Đặt câu hỏi',
};

/** Loại bài bắt buộc khai báo môn học và mã lớp để hệ thống ghép nhóm. */
export const COURSE_REQUIRED_TYPES: PostType[] = ['FIND_TEAMMATE', 'FIND_STUDY_GROUP'];

export const postSchema = z.object({
  id: z.string(),
  type: postTypeSchema,
  author: z.object({
    id: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
    /** Ví dụ "HCMUTE • Khoa CNTT". */
    headline: z.string().nullable(),
    cohort: z.string().nullable(),
  }),
  title: z.string().nullable(),
  content: z.string(),
  tags: z.array(z.string()),
  course: z
    .object({
      subject: z.string(),
      classCode: z.string(),
      semester: z.string().nullable(),
      lecturer: z.string().nullable(),
    })
    .nullable(),
  /** Thông tin tuyển thành viên (FIND_TEAMMATE). */
  recruitment: z
    .object({
      courseLabel: z.string(),
      techStack: z.string(),
      roles: z.string(),
      level: z.string(),
      timeline: z.string(),
      slotsFilled: z.number(),
      slotsTotal: z.number(),
    })
    .nullable(),
  /** Thông tin nhóm học (FIND_STUDY_GROUP). */
  studyGroup: z.object({ schedule: z.string(), goal: z.string() }).nullable(),
  /** Kỹ năng của người tìm project (FIND_PROJECT). */
  seeking: z.object({ skills: z.array(z.string()), availability: z.string() }).nullable(),
  likeCount: z.number(),
  commentCount: z.number(),
  likedByMe: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Post = z.infer<typeof postSchema>;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Tối đa ${max} ký tự.`)
    .transform((value) => (value === '' ? null : value));

/** Dữ liệu form tạo/sửa bài viết (popup "Tạo bài viết" trong Figma). */
export const postFormSchema = z
  .object({
    type: postTypeSchema,
    content: z.string().trim().min(10, 'Nội dung cần ít nhất 10 ký tự.').max(5000, 'Nội dung tối đa 5000 ký tự.'),
    tags: z.array(z.string()).max(8, 'Tối đa 8 tag.'),
    subject: z.string().trim().max(120, 'Tối đa 120 ký tự.'),
    classCode: z.string().trim().max(30, 'Tối đa 30 ký tự.'),
    semester: optionalText(40),
    lecturer: optionalText(80),
  })
  .superRefine((value, ctx) => {
    if (!COURSE_REQUIRED_TYPES.includes(value.type)) return;
    if (!value.subject) ctx.addIssue({ code: 'custom', path: ['subject'], message: 'Vui lòng nhập môn học.' });
    if (!value.classCode) ctx.addIssue({ code: 'custom', path: ['classCode'], message: 'Vui lòng nhập mã lớp.' });
  });
export type PostFormInput = z.input<typeof postFormSchema>;
export type PostInput = z.output<typeof postFormSchema>;

/** Chuẩn hóa tag người dùng gõ: bỏ #, khoảng trắng; trả null nếu không hợp lệ. */
export function normalizeTag(raw: string): string | null {
  const tag = raw.trim().replace(/^#+/, '').replace(/\s+/g, '');
  return /^[\p{L}\p{N}._+-]{1,30}$/u.test(tag) ? tag : null;
}
