import { request } from '../../../services/http-client';
import {
  beUserDetailSchema,
  userListResponseSchema,
  userPatchResultSchema,
  withEmptyExtras,
  type AdminUserDetail,
  type DirectoryStats,
  type UserListQuery,
  type UserListResult,
  type UserPatchResult,
  type UserRole,
  type UserStatus,
} from '../model/admin-user-schemas';

/** GET /users (chỉ ADMIN). Bỏ các tham số rỗng. */
export async function listUsers(query: UserListQuery, signal?: AbortSignal): Promise<UserListResult> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search.trim()) params.set('search', query.search.trim());
  if (query.role) params.set('role', query.role);
  if (query.status) params.set('status', query.status);

  const data = userListResponseSchema.parse(await request(`/users?${params.toString()}`, { signal }));
  return { items: data.items.map(withEmptyExtras), pagination: data.pagination };
}

/** GET /users/:id. Avatar, khóa và kỹ năng lấy từ hồ sơ; các khối chỉ có trong thiết kế để null. */
export async function getUserById(id: string, signal?: AbortSignal): Promise<AdminUserDetail> {
  const { profile, ...user } = beUserDetailSchema.parse(await request(`/users/${encodeURIComponent(id)}`, { signal }));
  return {
    ...withEmptyExtras(user),
    avatarUrl: profile?.avatarUrl ?? null,
    cohort: profile?.cohort ?? null,
    skills: profile?.skills?.length ? profile.skills.map((skill) => skill.name) : null,
    stats: null,
    verification: null,
    spaces: null,
    recentPosts: null,
  };
}

/** PATCH /users/:id/status (chỉ ADMIN). */
export async function updateUserStatus(id: string, status: UserStatus): Promise<UserPatchResult> {
  const data = await request(`/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return userPatchResultSchema.parse(data);
}

/** PATCH /users/:id/role (chỉ ADMIN). */
export async function updateUserRole(id: string, role: UserRole): Promise<UserPatchResult> {
  const data = await request(`/users/${encodeURIComponent(id)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return userPatchResultSchema.parse(data);
}

/** BE chưa có API thống kê danh bạ: luôn trả null để giao diện hiện "—". */
export async function getDirectoryStats(signal?: AbortSignal): Promise<DirectoryStats | null> {
  void signal;
  return null;
}
