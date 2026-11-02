// Gọi Profile API.
import { request } from '../../../services/http-client';
import type { ProfileUpdate } from '../model/profile-form';
import { profileSchema, type Profile } from '../model/profile-schemas';

/** userId = 'me' để lấy hồ sơ của chính người đang đăng nhập. */
export async function getProfile(userId: string, signal?: AbortSignal): Promise<Profile> {
  const path = userId === 'me' ? '/profiles/me' : `/profiles/${encodeURIComponent(userId)}`;
  return profileSchema.parse(await request(path, { signal }));
}

export async function updateMyProfile(input: ProfileUpdate): Promise<Profile> {
  const data = await request('/profiles/me', { method: 'PATCH', body: JSON.stringify(input) });
  return profileSchema.parse(data);
}
