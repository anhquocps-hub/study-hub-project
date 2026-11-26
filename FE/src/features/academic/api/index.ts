import { isMockApi } from '../../../shared/lib/api-mode';
import * as realApi from './academic-api';
import * as mockApi from './academic-api.mock';

export const academicApi = isMockApi('academic') ? mockApi : realApi;
