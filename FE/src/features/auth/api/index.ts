// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './auth-api';
import * as mockApi from './auth-api.mock';

export const authApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
