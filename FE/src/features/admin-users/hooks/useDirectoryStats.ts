import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { adminUsersApi } from '../api';

/** 5 ô thống kê đầu trang. BE chưa có API nên bản thật trả null. */
export function useDirectoryStats() {
  return useAsyncData('admin-users:stats', (signal) => adminUsersApi.getDirectoryStats(signal));
}
