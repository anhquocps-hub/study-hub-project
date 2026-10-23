import * as realApi from './academic-api';
import * as mockApi from './academic-api.mock';

export const academicApi = import.meta.env.VITE_USE_MOCK_API === 'true' ? mockApi : realApi;
