// Mock Community API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với communities-api.ts.
import { ApiError } from '../../../services/http-client';
import { MOCK_COMMUNITIES, mockMemberships, type CommunitySeed } from '../../../test/mock-communities';
import { mockDb } from '../../../test/mock-db';
import { normalizeSearch, type Community } from '../model/community-schemas';
import type { CommunityQuery } from './communities-api';

function requireSession() {
  const userId = mockDb.session.getUserId();
  if (!userId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  return userId;
}

/** Ghép dữ liệu gốc với trạng thái của người đang xem, giống BE. */
function view(seed: CommunitySeed, userId: string): Community {
  const membership = mockMemberships.of(userId)[seed.id] ?? 'NONE';
  const myUniversityId = mockDb.getProfile(userId)?.university?.id ?? null;
  const canJoin = seed.visibility !== 'SCHOOL_ONLY' || seed.university?.id === myUniversityId;
  return { ...seed, membership, canJoin, memberCount: seed.memberCount + (membership === 'MEMBER' ? 1 : 0) };
}

function find(communityId: string, userId: string) {
  const seed = MOCK_COMMUNITIES.find((item) => item.id === communityId);
  if (!seed) throw new ApiError(404, 'Không tìm thấy cộng đồng.');
  return view(seed, userId);
}

export async function listCommunities(query: CommunityQuery, signal?: AbortSignal): Promise<Community[]> {
  await mockDb.delay(350);
  signal?.throwIfAborted();
  const userId = requireSession();
  const keyword = normalizeSearch(query.q?.trim() ?? '');
  return MOCK_COMMUNITIES.map((seed) => view(seed, userId)).filter((item) => {
    const joined = item.membership === 'MEMBER';
    if (query.scope === 'joined' ? !joined : joined) return false;
    if (query.type && item.type !== query.type) return false;
    if (!keyword) return true;
    return normalizeSearch(`${item.name} ${item.subjectCode ?? ''} ${item.university?.shortName ?? ''}`).includes(keyword);
  });
}

export async function getCommunity(communityId: string, signal?: AbortSignal): Promise<Community> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  return find(communityId, requireSession());
}

export async function joinCommunity(communityId: string): Promise<Community> {
  await mockDb.delay(500);
  const userId = requireSession();
  const community = find(communityId, userId);
  if (community.membership !== 'NONE') return community; // bấm 2 lần: không tạo thêm yêu cầu
  if (!community.canJoin)
    throw new ApiError(403, `Chỉ sinh viên ${community.university?.shortName ?? 'cùng trường'} được tham gia cộng đồng này.`);
  mockMemberships.set(userId, communityId, community.visibility === 'PRIVATE' ? 'PENDING' : 'MEMBER');
  return find(communityId, userId);
}

export async function cancelJoinRequest(communityId: string): Promise<Community> {
  await mockDb.delay(400);
  const userId = requireSession();
  if (find(communityId, userId).membership === 'PENDING') mockMemberships.set(userId, communityId, 'NONE');
  return find(communityId, userId);
}

export async function leaveCommunity(communityId: string): Promise<Community> {
  await mockDb.delay(400);
  const userId = requireSession();
  if (find(communityId, userId).membership === 'MEMBER') mockMemberships.set(userId, communityId, 'NONE');
  return find(communityId, userId);
}
