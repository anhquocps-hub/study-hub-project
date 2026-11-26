import { describe, expect, it } from 'vitest';
import { isMockApi } from './api-mode';

describe('isMockApi', () => {
  it('không có danh sách riêng thì theo công tắc chung', () => {
    expect(isMockApi('auth', { VITE_USE_MOCK_API: 'true' })).toBe(true);
    expect(isMockApi('auth', { VITE_USE_MOCK_API: 'false' })).toBe(false);
  });

  it('feature có trong VITE_REAL_API_FEATURES thì gọi API thật, feature khác vẫn mock', () => {
    const env = { VITE_USE_MOCK_API: 'true', VITE_REAL_API_FEATURES: 'auth, admin-users' };
    expect(isMockApi('auth', env)).toBe(false);
    expect(isMockApi('admin-users', env)).toBe(false);
    expect(isMockApi('profiles', env)).toBe(true);
    expect(isMockApi('chat', env)).toBe(true);
  });

  it('chuỗi rỗng thì theo công tắc chung', () => {
    expect(isMockApi('auth', { VITE_USE_MOCK_API: 'true', VITE_REAL_API_FEATURES: '' })).toBe(true);
  });
});
