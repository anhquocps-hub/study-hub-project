import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .nullable()
  .optional()
  .refine((val) => !val || /^https?:\/\/\S+$/i.test(val), 'Liên kết phải bắt đầu bằng http:// hoặc https://');

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên cần ít nhất 2 ký tự.').max(50, 'Họ tên tối đa 50 ký tự.').optional(),
  universityId: z.string().optional(),
  majorId: z.string().optional(),
  cohort: z.string().trim().max(10, 'Khóa tối đa 10 ký tự, ví dụ K21.').nullable().optional(),
  studentId: z
    .string()
    .trim()
    .max(20, 'MSSV tối đa 20 ký tự.')
    .regex(/^[A-Za-z0-9]*$/, 'MSSV chỉ gồm chữ không dấu và số.')
    .nullable()
    .optional(),
  bio: z.string().max(500, 'Giới thiệu tối đa 500 ký tự.').optional(),
  skills: z
    .array(
      z.object({
        name: z.string().min(1),
        level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
      })
    )
    .max(20, 'Tối đa 20 kỹ năng.')
    .optional(),
  interests: z.array(z.string()).max(10, 'Tối đa 10 sở thích.').optional(),
  links: z
    .object({
      github: optionalUrl,
      linkedin: optionalUrl,
      portfolio: optionalUrl,
    })
    .optional(),
});
