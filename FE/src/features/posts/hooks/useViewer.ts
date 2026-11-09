import { useAuth } from '../../auth';
import { useProfile } from '../../profiles';

/**
 * Thông tin người đang xem cho bảng tin / chi tiết bài:
 * - viewer: tác giả bình luận, nhận diện bài/bình luận của mình.
 * - composerAuthor: phần đầu popup "Tạo bài viết".
 */
export function useViewer() {
  const { user } = useAuth();
  const { state } = useProfile('me');
  const profile = state.status === 'success' ? state.data : null;
  const fullName = profile?.fullName ?? user?.fullName ?? '';
  const avatarUrl = profile?.avatarUrl ?? null;
  const universityName = profile?.university?.name ?? null;
  // "ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)" → "HCMUTE"
  const universityShort = universityName?.match(/\(([^)]+)\)/)?.[1] ?? universityName;

  return {
    viewer: user ? { id: user.id, fullName, avatarUrl } : null,
    composerAuthor: { fullName, avatarUrl, university: universityShort, universityName },
  };
}
