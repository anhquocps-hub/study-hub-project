import * as realApi from './profile-api';
import * as mockApi from './profile-api.mock';

export const profileApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
