// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './communities-api';
import * as mockApi from './communities-api.mock';

export const communitiesApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
export type { CommunityQuery } from './communities-api';
