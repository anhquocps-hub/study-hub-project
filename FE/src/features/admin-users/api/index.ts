// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './admin-users-api';
import * as mockApi from './admin-users-api.mock';

export const adminUsersApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
