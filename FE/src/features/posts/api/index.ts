// Chọn API thật hay mock theo biến môi trường VITE_USE_MOCK_API trong FE/.env.
import * as realCommentsApi from './comments-api';
import * as mockCommentsApi from './comments-api.mock';
import * as realPostsApi from './posts-api';
import * as mockPostsApi from './posts-api.mock';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

export const postsApi = useMock ? mockPostsApi : realPostsApi;
export const commentsApi = useMock ? mockCommentsApi : realCommentsApi;
export type { PostQuery } from './posts-api';
export type { CommentQuery } from './comments-api';
