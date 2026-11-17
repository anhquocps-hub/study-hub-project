// Gọi Community API thật của BE.
import { request } from '../../../services/http-client';
import {
  communityListSchema,
  communitySchema,
  type Community,
  type CommunityType,
} from '../model/community-schemas';

export interface CommunityQuery {
  /** joined = đã tham gia; discover = chưa tham gia. */
  scope: 'joined' | 'discover';
  type?: CommunityType;
  /** Tìm theo tên, mã môn, tên trường. */
  q?: string;
}

export async function listCommunities(query: CommunityQuery, signal?: AbortSignal): Promise<Community[]> {
  const params = new URLSearchParams({ scope: query.scope });
  if (query.type) params.set('type', query.type);
  if (query.q) params.set('q', query.q);
  return communityListSchema.parse(await request(`/communities?${params}`, { signal }));
}

export async function getCommunity(communityId: string, signal?: AbortSignal): Promise<Community> {
  return communitySchema.parse(await request(`/communities/${encodeURIComponent(communityId)}`, { signal }));
}

/** Public / School-only: vào ngay (MEMBER). Private: tạo yêu cầu (PENDING). BE trả cộng đồng sau khi cập nhật. */
export async function joinCommunity(communityId: string): Promise<Community> {
  const data = await request(`/communities/${encodeURIComponent(communityId)}/join`, { method: 'POST' });
  return communitySchema.parse(data);
}

/** Hủy yêu cầu tham gia đang chờ duyệt. */
export async function cancelJoinRequest(communityId: string): Promise<Community> {
  const data = await request(`/communities/${encodeURIComponent(communityId)}/join-request`, { method: 'DELETE' });
  return communitySchema.parse(data);
}

export async function leaveCommunity(communityId: string): Promise<Community> {
  const data = await request(`/communities/${encodeURIComponent(communityId)}/membership`, { method: 'DELETE' });
  return communitySchema.parse(data);
}
