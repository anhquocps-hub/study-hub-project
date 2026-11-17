import { z } from 'zod';

/** Loại cộng đồng theo PRD mục 11. */
export const communityTypeSchema = z.enum(['UNIVERSITY', 'SUBJECT', 'INTEREST']);
export type CommunityType = z.infer<typeof communityTypeSchema>;

/** Phạm vi theo PRD mục 11: ai được xem và tham gia. */
export const visibilitySchema = z.enum(['PUBLIC', 'SCHOOL_ONLY', 'PRIVATE']);
export type Visibility = z.infer<typeof visibilitySchema>;

/** Quan hệ của người đang xem với cộng đồng. PENDING = đã gửi yêu cầu, chờ duyệt (Private). */
export const membershipSchema = z.enum(['NONE', 'PENDING', 'MEMBER']);
export type Membership = z.infer<typeof membershipSchema>;

export const communitySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: communityTypeSchema,
  visibility: visibilitySchema,
  /** Trường của cộng đồng; null với cộng đồng sở thích không gắn trường. */
  university: z.object({ id: z.string(), shortName: z.string() }).nullable(),
  /** Mã học phần, chỉ có ở cộng đồng môn học. */
  subjectCode: z.string().nullable(),
  description: z.string(),
  memberCount: z.number(),
  membership: membershipSchema,
  /** BE tính sẵn theo trường trong hồ sơ: false khi SCHOOL_ONLY mà khác trường. */
  canJoin: z.boolean(),
});
export type Community = z.infer<typeof communitySchema>;

export const communityListSchema = z.array(communitySchema);

export const TYPE_LABELS: Record<CommunityType, string> = {
  UNIVERSITY: 'Trường',
  SUBJECT: 'Môn học',
  INTEREST: 'Sở thích',
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: 'Công khai',
  SCHOOL_ONLY: 'Nội bộ trường',
  PRIVATE: 'Riêng tư',
};

/** Người chưa tham gia có được xem nội dung không (giống nhóm Facebook). */
export function canPreview(community: Community) {
  if (community.membership === 'MEMBER') return true;
  if (community.visibility === 'PUBLIC') return true;
  return community.visibility === 'SCHOOL_ONLY' && community.canJoin;
}

/** Bỏ dấu tiếng Việt để tìm "co so du lieu" vẫn ra "Cơ sở dữ liệu". */
export function normalizeSearch(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/gi, 'd').toLowerCase();
}
