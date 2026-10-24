// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './chat-api';
import * as mockApi from './chat-api.mock';

export const chatApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
