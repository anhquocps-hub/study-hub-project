// Chọn API thật hay mock: VITE_REAL_API_FEATURES / VITE_USE_MOCK_API trong FE/.env (xem shared/lib/api-mode.ts).
import { isMockApi } from '../../../shared/lib/api-mode';
import { withMockSessionBridge } from '../../../test/mock-session-bridge';
import * as realApi from './auth-api';
import * as mockApi from './auth-api.mock';

/** Auth thật nhưng bảng tin/chat còn mock: giữ phiên mock khớp với người dùng thật. */
const needsBridge = isMockApi('posts') || isMockApi('chat');

export const authApi = isMockApi('auth') ? mockApi : needsBridge ? withMockSessionBridge(realApi) : realApi;
