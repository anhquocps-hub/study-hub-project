import { z } from 'zod';

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type University = z.infer<typeof universitySchema>;

export const universityListSchema = z.array(universitySchema);

export const majorSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Major = z.infer<typeof majorSchema>;

export const majorListSchema = z.array(majorSchema);

export const subjectSchema = z.object({
  id: z.string(),
  /** Mã học phần, ví dụ "IT204". */
  code: z.string(),
  name: z.string(),
  credits: z.number(),
});
export type Subject = z.infer<typeof subjectSchema>;

export const subjectListSchema = z.array(subjectSchema);

/** Trường, ngành và các môn đang học của người dùng (bước onboarding). */
export const myAcademicSchema = z.object({
  universityId: z.string().nullable(),
  majorId: z.string().nullable(),
  subjectIds: z.array(z.string()),
});
export type MyAcademic = z.infer<typeof myAcademicSchema>;

export const MAX_SUBJECTS = 12;

export const academicFormSchema = z.object({
  universityId: z.string().min(1, 'Vui lòng chọn trường.'),
  majorId: z.string().min(1, 'Vui lòng chọn ngành.'),
  subjectIds: z.array(z.string()).max(MAX_SUBJECTS, `Chọn tối đa ${MAX_SUBJECTS} môn.`),
});
export type AcademicFormValues = z.infer<typeof academicFormSchema>;
