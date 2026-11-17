import { useCallback, useEffect, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { communitiesApi, type CommunityQuery } from '../api';
import type { Community } from '../model/community-schemas';

// Báo cho các nơi đang hiện danh sách "đã tham gia" (thanh bên trái) tải lại sau khi tham gia/rời.
const listeners = new Set<() => void>();
const notifyMembershipChanged = () => listeners.forEach((listener) => listener());

function useMembershipVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return version;
}

export function useCommunities(query: CommunityQuery) {
  const key = `communities:${query.scope}:${query.type ?? ''}:${query.q ?? ''}`;
  return useAsyncData(key, (signal) => communitiesApi.listCommunities(query, signal));
}

/** Cộng đồng đã tham gia; tự tải lại khi người dùng tham gia/rời ở bất kỳ đâu. */
export function useMyCommunities() {
  const version = useMembershipVersion();
  return useAsyncData(`communities:mine:${version}`, (signal) =>
    communitiesApi.listCommunities({ scope: 'joined' }, signal),
  );
}

export function useCommunity(communityId: string) {
  return useAsyncData(`community:${communityId}`, (signal) => communitiesApi.getCommunity(communityId, signal));
}

export type MembershipAction = 'join' | 'cancel' | 'leave';

/** Gọi API tham gia / hủy yêu cầu / rời, trả cộng đồng sau khi cập nhật. Lỗi được ném ra cho nơi gọi hiển thị. */
export function useMembershipAction() {
  return useCallback(async (communityId: string, action: MembershipAction): Promise<Community> => {
    const run = {
      join: communitiesApi.joinCommunity,
      cancel: communitiesApi.cancelJoinRequest,
      leave: communitiesApi.leaveCommunity,
    }[action];
    const updated = await run(communityId);
    notifyMembershipChanged();
    return updated;
  }, []);
}
