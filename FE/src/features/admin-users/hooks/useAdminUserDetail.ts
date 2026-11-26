import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { adminUsersApi } from '../api';

/** Chi tiết một người dùng cho ngăn bên phải; đổi id thì tải lại. */
export function useAdminUserDetail(userId: string) {
  return useAsyncData(`admin-user:${userId}`, (signal) => adminUsersApi.getUserById(userId, signal));
}
