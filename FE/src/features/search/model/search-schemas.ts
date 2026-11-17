import { z } from 'zod';
import { communitySchema } from '../../communities/model/community-schemas';
import { postSchema, postTypeSchema, POST_TYPE_LABELS, type PostType } from '../../posts/model/post-schemas';

/** 4 tab theo PRD mục 27 / SRS 4.6. */
export const searchTabSchema = z.enum(['posts', 'people', 'communities', 'groups']);
export type SearchTab = z.infer<typeof searchTabSchema>;

export const TAB_LABELS: Record<SearchTab, string> = {
  posts: 'Bài viết',
  people: 'Người',
  communities: 'Cộng đồng',
  groups: 'Nhóm',
};

export const levelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type Level = z.infer<typeof levelSchema>;
export const LEVEL_LABELS: Record<Level, string> = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };

export const groupStatusSchema = z.enum(['RECRUITING', 'FULL', 'CLOSED']);
export type GroupStatus = z.infer<typeof groupStatusSchema>;
export const STATUS_LABELS: Record<GroupStatus, string> = { RECRUITING: 'Đang tuyển', FULL: 'Đã đủ', CLOSED: 'Đã đóng' };

export const roleSchema = z.enum(['FRONTEND', 'BACKEND', 'FULLSTACK', 'MOBILE', 'UI_UX', 'DATA_AI', 'TESTER']);
export type Role = z.infer<typeof roleSchema>;
export const ROLE_LABELS: Record<Role, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  FULLSTACK: 'Fullstack',
  MOBILE: 'Mobile',
  UI_UX: 'UI/UX Designer',
  DATA_AI: 'Data / AI',
  TESTER: 'Tester / QA',
};

/** Bộ lọc theo PRD mục 27: Academic, Project, Post, Status. Ô nào trống là không lọc. */
export interface SearchFilters {
  universityId?: string;
  majorId?: string;
  subject?: string;
  classCode?: string;
  lecturer?: string;
  /** "2026-2027:HK1" | "2026-2027:HK2" | "2026-2027:HE" */
  term?: string;
  skill?: string;
  technology?: string;
  role?: Role;
  level?: Level;
  postType?: PostType;
  status?: GroupStatus;
}
export type FilterKey = keyof SearchFilters;

export const FILTER_KEYS: FilterKey[] = [
  'universityId',
  'majorId',
  'subject',
  'classCode',
  'lecturer',
  'term',
  'skill',
  'technology',
  'role',
  'level',
  'postType',
  'status',
];

/** Bộ lọc nào có nghĩa với tab nào; bộ lọc không áp dụng được ẩn khỏi popup và không gửi lên API. */
export const TAB_FILTERS: Record<SearchTab, FilterKey[]> = {
  posts: FILTER_KEYS,
  people: ['universityId', 'majorId', 'subject', 'skill', 'technology', 'role', 'level'],
  communities: ['universityId', 'majorId', 'subject'],
  groups: ['universityId', 'majorId', 'subject', 'classCode', 'lecturer', 'term', 'skill', 'technology', 'role', 'level', 'status'],
};

const ENUM_PARSERS: Partial<Record<FilterKey, z.ZodType>> = {
  role: roleSchema,
  level: levelSchema,
  postType: postTypeSchema,
  status: groupStatusSchema,
};

/** Đọc bộ lọc từ URL; giá trị lạ (gõ tay, link cũ) bị bỏ qua thay vì làm hỏng trang. */
export function filtersFromParams(params: URLSearchParams): SearchFilters {
  const filters: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim();
    if (!value || value.length > 120) continue;
    const parser = ENUM_PARSERS[key];
    if (parser && !parser.safeParse(value).success) continue;
    filters[key] = value;
  }
  return filters as SearchFilters;
}

/** Chỉ giữ bộ lọc áp dụng được cho tab, bỏ ô trống. */
export function filtersForTab(filters: SearchFilters, tab: SearchTab): SearchFilters {
  const result: Record<string, string> = {};
  for (const key of TAB_FILTERS[tab]) {
    const value = filters[key];
    if (value) result[key] = value;
  }
  return result as SearchFilters;
}

/** Học kỳ của năm học hiện tại: năm học mới bắt đầu từ tháng 8. */
export function termOptions(now = new Date()) {
  const start = now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const year = `${start}-${start + 1}`;
  return [
    { value: `${year}:HK1`, label: `HK1 (${start})` },
    { value: `${year}:HK2`, label: `HK2 (${start} - ${start + 1})` },
    { value: `${year}:HE`, label: 'Học kỳ Hè' },
  ];
}

export function termLabel(value: string) {
  const [year = '', term] = value.split(':');
  const [start, end] = year.split('-');
  if (term === 'HK1') return `HK1 (${start})`;
  if (term === 'HK2') return `HK2 (${start} - ${end})`;
  return `Học kỳ Hè ${end ?? ''}`.trim();
}

export { POST_TYPE_LABELS };

export const personSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
  university: z.string().nullable(),
  major: z.string().nullable(),
  cohort: z.string().nullable(),
  role: roleSchema.nullable(),
  skills: z.array(z.string()),
  /** Giới thiệu ngắn một dòng. */
  headline: z.string().nullable(),
});
export type Person = z.infer<typeof personSchema>;

/** Nhóm = Space hình thành từ bài tuyển (PRD mục 21–22). */
export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['PROJECT', 'STUDY']),
  status: groupStatusSchema,
  memberCount: z.number(),
  maxMembers: z.number(),
  subject: z.string().nullable(),
  university: z.string().nullable(),
  lookingFor: z.array(z.string()),
  isMember: z.boolean(),
});
export type Group = z.infer<typeof groupSchema>;

export const searchCountsSchema = z.object({
  posts: z.number(),
  people: z.number(),
  communities: z.number(),
  groups: z.number(),
});
export type SearchCounts = z.infer<typeof searchCountsSchema>;

const ITEM_SCHEMAS = { posts: postSchema, people: personSchema, communities: communitySchema, groups: groupSchema };

export function searchResponseSchema<T extends SearchTab>(tab: T) {
  return z.object({
    items: z.array(ITEM_SCHEMAS[tab] as (typeof ITEM_SCHEMAS)[T]),
    /** null = hết kết quả. */
    nextCursor: z.string().nullable(),
    counts: searchCountsSchema,
  });
}

export type SearchItem = {
  posts: z.infer<typeof postSchema>;
  people: Person;
  communities: z.infer<typeof communitySchema>;
  groups: Group;
};

export interface SearchPage<T extends SearchTab> {
  items: SearchItem[T][];
  nextCursor: string | null;
  counts: SearchCounts;
}
