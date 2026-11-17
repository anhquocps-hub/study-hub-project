// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realApi from './search-api';
import * as mockApi from './search-api.mock';

export const searchApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
export { PAGE_SIZE, type SearchQuery } from './search-api';
