import { isMockApi } from '../../../shared/lib/api-mode';
import * as realApi from './profile-api';
import * as mockApi from './profile-api.mock';

export const profileApi = isMockApi('profiles') ? mockApi : realApi;
