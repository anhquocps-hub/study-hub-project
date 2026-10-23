import { z } from 'zod';
import { SKILL_LEVELS, type Profile } from './profile-schemas';

export const MAX_SKILLS = 20;
export const MAX_INTERESTS = 10;
export const MAX_BIO_LENGTH = 500;

/** Rỗng hoặc link http(s). Chặn kiểu "javascript:..." vì link sẽ được gắn vào thẻ <a>. */
const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), 'Liên kết phải bắt đầu bằng http:// hoặc https://');

/** Dữ liệu của form sửa hồ sơ; khác Profile ở chỗ ô trống là chuỗi rỗng và chỉ lưu id của trường, ngành. */
export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự.').max(50, 'Họ tên tối đa 50 ký tự.'),
  universityId: z.string().min(1, 'Vui lòng chọn trường.'),
  majorId: z.string().min(1, 'Vui lòng chọn ngành.'),
  cohort: z.string().trim().max(10, 'Khóa tối đa 10 ký tự, ví dụ K21.'),
  studentId: z
    .string()
    .trim()
    .max(20, 'MSSV tối đa 20 ký tự.')
    .regex(/^[A-Za-z0-9]*$/, 'MSSV chỉ gồm chữ không dấu và số.'),
  bio: z.string().max(MAX_BIO_LENGTH, `Giới thiệu tối đa ${MAX_BIO_LENGTH} ký tự.`),
  skills: z
    .array(z.object({ name: z.string(), level: z.enum(SKILL_LEVELS) }))
    .max(MAX_SKILLS, `Tối đa ${MAX_SKILLS} kỹ năng.`),
  interests: z.array(z.string()).max(MAX_INTERESTS, `Tối đa ${MAX_INTERESTS} sở thích.`),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function toFormValues(profile: Profile): ProfileFormValues {
  return {
    fullName: profile.fullName,
    universityId: profile.university?.id ?? '',
    majorId: profile.major?.id ?? '',
    cohort: profile.cohort ?? '',
    studentId: profile.studentId ?? '',
    bio: profile.bio,
    skills: profile.skills,
    interests: profile.interests,
    githubUrl: profile.links.github ?? '',
    linkedinUrl: profile.links.linkedin ?? '',
    portfolioUrl: profile.links.portfolio ?? '',
  };
}

/** Dữ liệu gửi lên PATCH /profiles/me: ô trống thành null. */
export function toProfileUpdate(values: ProfileFormValues) {
  const orNull = (value: string) => (value === '' ? null : value);
  return {
    fullName: values.fullName,
    universityId: values.universityId,
    majorId: values.majorId,
    cohort: orNull(values.cohort),
    studentId: orNull(values.studentId),
    bio: values.bio,
    skills: values.skills,
    interests: values.interests,
    links: {
      github: orNull(values.githubUrl),
      linkedin: orNull(values.linkedinUrl),
      portfolio: orNull(values.portfolioUrl),
    },
  };
}
export type ProfileUpdate = ReturnType<typeof toProfileUpdate>;

/** Tên lỗi BE có thể trả (theo đường dẫn trong ProfileUpdate) → tên ô tương ứng trong form. */
export const SERVER_FIELD_TO_FORM_FIELD: Record<string, keyof ProfileFormValues> = {
  fullName: 'fullName',
  universityId: 'universityId',
  majorId: 'majorId',
  cohort: 'cohort',
  studentId: 'studentId',
  bio: 'bio',
  skills: 'skills',
  interests: 'interests',
  'links.github': 'githubUrl',
  'links.linkedin': 'linkedinUrl',
  'links.portfolio': 'portfolioUrl',
};
