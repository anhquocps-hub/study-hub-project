// Mock Profile API, dùng khi VITE_USE_MOCK_API=true. Dữ liệu nằm ở src/test/mock-db.ts.
import { mockDb } from '../../../test/mock-db';
import { ApiError } from '../../../services/http-client';
import type { Profile } from '../model/profile-schemas';

export async function getProfile(userId: string, signal?: AbortSignal): Promise<Profile> {
  await mockDb.delay(400);
  signal?.throwIfAborted();
  const sessionUserId = mockDb.session.getUserId();
  if (!sessionUserId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');

  const isMe = userId === 'me' || userId === sessionUserId;
  const profile = mockDb.getProfile(isMe ? sessionUserId : userId);
  if (!profile) throw new ApiError(404, 'Không tìm thấy người dùng.');
  // Giống BE: không trả MSSV của người khác
  return isMe ? profile : { ...profile, studentId: null };
}
