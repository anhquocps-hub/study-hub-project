/**
 * Mock Admin Users API, dùng khi VITE_USE_MOCK_API=true.
 * Cùng tên hàm và kiểu trả về với admin-users-api.ts. Dữ liệu lấy từ src/test/mock-db.ts (tài khoản) và
 * src/test/mock-directory.ts (trường mở rộng), nên khóa tài khoản ở đây thì tài khoản đó không đăng nhập được nữa.
 */
import { ApiError } from '../../../services/http-client';
import { MOCK_DIRECTORY_STATS, MOCK_USER_EXTRAS } from '../../../test/mock-directory';
import { mockDb, type StoredAccount } from '../../../test/mock-db';
import {
  EMPTY_EXTRAS,
  type AdminUser,
  type AdminUserDetail,
  type DirectoryStats,
  type UserListQuery,
  type UserListResult,
  type UserPatchResult,
  type UserRole,
  type UserStatus,
} from '../model/admin-user-schemas';

function toAdminUser(account: StoredAccount): AdminUser {
  const { profile } = account;
  return {
    id: profile.userId,
    email: account.email,
    fullName: profile.fullName,
    studentId: profile.studentId,
    role: account.role,
    status: account.status,
    profileCompleted: Boolean(profile.university && profile.major),
    createdAt: account.createdAt,
    university: profile.university,
    ...(MOCK_USER_EXTRAS[profile.userId] ?? EMPTY_EXTRAS),
  };
}

export async function listUsers(query: UserListQuery, signal?: AbortSignal): Promise<UserListResult> {
  void signal;
  await mockDb.delay(300);
  const keyword = query.search.trim().toLowerCase();

  const matched = mockDb
    .listAccounts()
    .filter((account) => !query.role || account.role === query.role)
    .filter((account) => !query.status || account.status === query.status)
    .filter(
      (account) =>
        !keyword ||
        [account.profile.fullName, account.email, account.profile.studentId ?? ''].some((field) =>
          field.toLowerCase().includes(keyword),
        ),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const page = Math.max(1, query.page);
  const start = (page - 1) * query.limit;
  return {
    items: matched.slice(start, start + query.limit).map(toAdminUser),
    pagination: {
      page,
      limit: query.limit,
      total: matched.length,
      totalPages: Math.ceil(matched.length / query.limit),
    },
  };
}

/** Chi tiết theo thiết kế cho Minh Tuấn; người khác sinh từ dữ liệu sẵn có. */
function buildDetail(user: AdminUser): AdminUserDetail {
  const isDesignUser = user.id === 'u-minh-tuan';
  const seed = [...user.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    ...user,
    stats: isDesignUser
      ? { spaces: 12, posts: 34, reports: 0 }
      : { spaces: seed % 9, posts: seed % 41, reports: user.status === 'BANNED' ? 3 + (seed % 5) : 0 },
    verification: [
      { label: 'Trường đào tạo', value: user.university?.name ?? '—' },
      { label: 'Khoa chuyên môn', value: user.faculty ?? '—' },
      { label: 'Lớp sinh hoạt', value: user.className ?? '—' },
      { label: 'Căn cước / Định danh', value: `0792010${String(seed).padStart(4, '0').slice(-4)}****` },
    ],
    spaces: [
      { id: 's-datn', name: 'Đồ Án Tốt Nghiệp CNTT 2024', role: 'Team Leader', members: 4, tag: 'Đang tuyển' },
      { id: 's-gdsc', name: 'CLB Học thuật Google DSC HCMUTE', role: 'Core Member', members: 250, tag: 'Guild' },
      { id: 's-csdl', name: 'Ôn Thi Cuối Kỳ - Cơ Sở Dữ Liệu IT204', role: 'Thành viên', members: 82, tag: 'Lớp học' },
    ].slice(0, isDesignUser ? 3 : 1 + (seed % 3)),
    recentPosts: [
      {
        id: 'p-hackathon',
        title: '[Tìm Đồng Đội Hackathon] Cần 01 Backend Golang',
        excerpt:
          'Chào anh em, team mình đang hoàn thiện prototype app chia sẻ tài liệu ôn thi cho HCMUTE, hiện đã có 2 FE React và 1 Designer, cần 1 bạn backend cứng Golang/Postgres...',
        at: 'Hôm qua 21:04',
        likes: 24,
        comments: 8,
        status: 'Hợp lệ',
      },
      {
        id: 'p-nestjs',
        title: 'Chia sẻ source code mẫu Microservices với NestJS',
        excerpt: 'Link GitHub demo và slide giải thích kiến trúc Clean Architecture dành cho sinh viên IT...',
        at: '14/10 10:15',
        likes: 12,
        comments: 3,
        status: 'Hợp lệ',
      },
    ],
  };
}

export async function getUserById(id: string, signal?: AbortSignal): Promise<AdminUserDetail> {
  void signal;
  await mockDb.delay(300);
  const account = mockDb.getAccount(id);
  if (!account) throw new ApiError(404, 'Không tìm thấy người dùng này.');
  return buildDetail(toAdminUser(account));
}

function assertNotSelf(id: string) {
  if (id === mockDb.session.getUserId()) {
    throw new ApiError(400, 'Bạn không thể thao tác trên tài khoản của chính mình.');
  }
}

function patchAccount(id: string, patch: Partial<Pick<StoredAccount, 'role' | 'status'>>): UserPatchResult {
  const account = mockDb.updateAccount(id, patch);
  if (!account) throw new ApiError(404, 'Không tìm thấy người dùng.');
  return { id, role: account.role, status: account.status };
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<UserPatchResult> {
  await mockDb.delay(400);
  assertNotSelf(id);
  return patchAccount(id, { status });
}

export async function updateUserRole(id: string, role: UserRole): Promise<UserPatchResult> {
  await mockDb.delay(400);
  assertNotSelf(id);
  return patchAccount(id, { role });
}

export async function getDirectoryStats(signal?: AbortSignal): Promise<DirectoryStats | null> {
  void signal;
  await mockDb.delay(200);
  return MOCK_DIRECTORY_STATS;
}
