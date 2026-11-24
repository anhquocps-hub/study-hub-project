import { z } from 'zod';

/**
 * Kiểu dữ liệu của trang Admin quản lý người dùng.
 *
 * "Trường mở rộng" là dữ liệu có trong thiết kế nhưng BE chưa trả về. Mock điền đủ; API thật để null và giao diện
 * hiện "—" hoặc "Chưa có dữ liệu". Khi BE bổ sung trường nào chỉ cần sửa schema + hàm gọi API.
 */

export type ModerationKind = 'WARNING' | 'TEMP_BAN' | 'FLAGGED' | 'VERIFIED' | 'ACTIVE_POSITIVE';

export interface AdminUserExtras {
  avatarUrl: string | null;
  /** Tên tài khoản phụ, ví dụ "user_4912". */
  username: string | null;
  /** Khóa học, ví dụ "K21". */
  cohort: string | null;
  faculty: string | null;
  className: string | null;
  /** Chức danh hiển thị thay cho MSSV, ví dụ "Giảng viên". */
  title: string | null;
  /** Dòng phụ dưới cột trường/khoa, ví dụ "GPA: 3.65 • Top Guild Lead". */
  highlight: string | null;
  skills: string[] | null;
  /** Độ tin cậy 0–100. */
  trustScore: number | null;
  /** Ví dụ "0 vi phạm", "5 báo cáo". */
  violationSummary: string | null;
  moderation: { kind: ModerationKind; label: string; detail: string | null } | null;
}

// ——— Dữ liệu BE trả về (GET /users, GET /users/:id, PATCH /users/:id/...) ———

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export const USER_STATUSES = ['ACTIVE', 'BANNED'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

/** Một người dùng trong danh sách GET /users (đúng các trường BE đang chọn). */
export const beUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  studentId: z.string().nullable(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
  profileCompleted: z.boolean(),
  createdAt: z.string(),
  university: z.object({ id: z.string(), name: z.string() }).nullable(),
});
export type BeUser = z.infer<typeof beUserSchema>;

/** GET /users/:id: như danh sách, thêm hồ sơ (chỉ đọc những trường FE dùng). */
export const beUserDetailSchema = beUserSchema.extend({
  profile: z
    .object({
      avatarUrl: z.string().nullable().optional(),
      cohort: z.string().nullable().optional(),
      skills: z.array(z.object({ name: z.string() })).nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const userListResponseSchema = z.object({
  items: z.array(beUserSchema),
  pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }),
});

/** PATCH /users/:id/status|role chỉ trả một phần người dùng. */
export const userPatchResultSchema = z.object({
  id: z.string(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});
export type UserPatchResult = z.infer<typeof userPatchResultSchema>;

export type AdminUser = BeUser & AdminUserExtras;

export interface AdminUserDetail extends AdminUser {
  stats: { spaces: number; posts: number; reports: number } | null;
  verification: { label: string; value: string }[] | null;
  spaces: { id: string; name: string; role: string; members: number; tag: string }[] | null;
  recentPosts:
    | { id: string; title: string; excerpt: string; at: string; likes: number; comments: number; status: string }[]
    | null;
}

export interface DirectoryStats {
  total: { value: number; delta: string };
  online: { value: number; ratio: string };
  warned: { value: number };
  banned: { value: number; ratio: string };
  staff: { value: number };
}

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface UserListQuery {
  page: number;
  limit: PageSize;
  search: string;
  role: UserRole | '';
  status: UserStatus | '';
}

export interface UserListResult {
  items: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const EMPTY_EXTRAS: AdminUserExtras = {
  avatarUrl: null,
  username: null,
  cohort: null,
  faculty: null,
  className: null,
  title: null,
  highlight: null,
  skills: null,
  trustScore: null,
  violationSummary: null,
  moderation: null,
};

/** Người dùng từ BE thật: mọi trường mở rộng là null. */
export function withEmptyExtras(user: BeUser): AdminUser {
  return { ...user, ...EMPTY_EXTRAS };
}
