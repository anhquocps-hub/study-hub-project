/** Các feature có cặp API thật / mock (features/<tên>/api). */
export type ApiFeature = 'auth' | 'admin-users' | 'profiles' | 'academic' | 'posts' | 'chat';

interface ApiModeEnv {
  VITE_USE_MOCK_API?: string;
  VITE_REAL_API_FEATURES?: string;
}

/**
 * Feature này có dùng mock không.
 * - VITE_REAL_API_FEATURES (vd "auth,admin-users"): các feature trong danh sách luôn gọi BE thật,
 *   để bật dần từng phần đã có API mà các phần khác (chưa có BE) vẫn chạy mock.
 * - Feature không có trong danh sách: theo công tắc chung VITE_USE_MOCK_API.
 */
export function isMockApi(feature: ApiFeature, env: ApiModeEnv = import.meta.env): boolean {
  const realFeatures = (env.VITE_REAL_API_FEATURES ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  if (realFeatures.includes(feature)) return false;
  return env.VITE_USE_MOCK_API === 'true';
}
