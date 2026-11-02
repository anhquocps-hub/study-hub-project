// Mock Profile API, dùng khi VITE_USE_MOCK_API=true. Dữ liệu nằm ở src/test/mock-db.ts.
import { MOCK_MAJORS, MOCK_UNIVERSITIES, mockDb } from '../../../test/mock-db';
import { ApiError } from '../../../services/http-client';
import type { ProfileUpdate } from '../model/profile-form';
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

export async function updateMyProfile(input: ProfileUpdate): Promise<Profile> {
  await mockDb.delay(600);
  const sessionUserId = mockDb.session.getUserId();
  if (!sessionUserId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  const current = mockDb.getProfile(sessionUserId);
  if (!current) throw new ApiError(404, 'Không tìm thấy người dùng.');

  const university = MOCK_UNIVERSITIES.find((item) => item.id === input.universityId);
  if (!university) throw new ApiError(400, 'Dữ liệu không hợp lệ.', { universityId: 'Trường không tồn tại.' });
  const major = (MOCK_MAJORS[input.universityId] ?? []).find((item) => item.id === input.majorId);
  if (!major) throw new ApiError(400, 'Dữ liệu không hợp lệ.', { majorId: 'Ngành không thuộc trường đã chọn.' });

  return mockDb.saveProfile({
    ...current,
    fullName: input.fullName,
    studentId: input.studentId,
    university,
    major,
    cohort: input.cohort,
    bio: input.bio,
    skills: input.skills,
    interests: input.interests,
    links: input.links,
  });
}
