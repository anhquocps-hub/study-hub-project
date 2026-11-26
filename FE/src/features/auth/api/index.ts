// Chọn API thật hay mock: VITE_REAL_API_FEATURES / VITE_USE_MOCK_API trong FE/.env (xem shared/lib/api-mode.ts).
import { isMockApi } from '../../../shared/lib/api-mode';
import * as realApi from './auth-api';
import * as mockApi from './auth-api.mock';

export const authApi = isMockApi('auth') ? mockApi : realApi;
