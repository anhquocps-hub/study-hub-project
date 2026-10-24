// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './posts-api';
import * as mockApi from './posts-api.mock';

export const postsApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
export type { PostQuery } from './posts-api';
