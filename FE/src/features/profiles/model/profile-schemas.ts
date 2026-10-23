import { z } from 'zod';

export const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: 'Cơ bản',
  INTERMEDIATE: 'Trung bình',
  ADVANCED: 'Nâng cao',
};

const namedRef = z.object({ id: z.string(), name: z.string() });

/** Hồ sơ do BE trả về từ GET /profiles/me và GET /profiles/:userId. */
export const profileSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
  /** MSSV: BE chỉ trả cho chính chủ, hồ sơ người khác luôn là null. */
  studentId: z.string().nullable(),
  university: namedRef.nullable(),
  major: namedRef.nullable(),
  /** Khóa, ví dụ "K21". */
  cohort: z.string().nullable(),
  bio: z.string(),
  skills: z.array(z.object({ name: z.string(), level: z.enum(SKILL_LEVELS) })),
  interests: z.array(z.string()),
  links: z.object({
    github: z.string().nullable(),
    linkedin: z.string().nullable(),
    portfolio: z.string().nullable(),
  }),
  /** Project đã tham gia, BE tổng hợp từ các Space; chỉ đọc. */
  projects: z.array(z.object({ id: z.string(), name: z.string(), role: z.string() })),
});
export type Profile = z.infer<typeof profileSchema>;
