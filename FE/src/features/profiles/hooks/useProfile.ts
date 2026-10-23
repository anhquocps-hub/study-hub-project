import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { profileApi } from '../api';

/** Tải hồ sơ; userId = 'me' cho hồ sơ của chính mình. Đổi userId thì tự tải lại. */
export function useProfile(userId: string) {
  return useAsyncData(`profile:${userId}`, (signal) => profileApi.getProfile(userId, signal));
}
