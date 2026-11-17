// Public API của feature communities (danh sách, chi tiết, tham gia/rời cộng đồng).
export { CommunityAvatar, CommunityCard, communityMeta, VisibilityBadge } from './components/CommunityCard';
export { CommunityGate, JoinBar } from './components/CommunityGate';
export { MembershipButton } from './components/MembershipButton';
export { useCommunities, useCommunity, useMyCommunities } from './hooks/useCommunities';
export {
  canPreview,
  normalizeSearch,
  TYPE_LABELS,
  type Community,
  type CommunityType,
  type Membership,
  type Visibility,
} from './model/community-schemas';
