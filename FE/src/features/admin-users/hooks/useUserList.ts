import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { adminUsersApi } from '../api';
import type { UserListQuery } from '../model/admin-user-schemas';

/** Tải một trang người dùng theo bộ lọc; đổi bộ lọc thì tự tải lại và hủy request cũ. */
export function useUserList(query: UserListQuery) {
  return useAsyncData(`admin-users:${JSON.stringify(query)}`, (signal) => adminUsersApi.listUsers(query, signal));
}
