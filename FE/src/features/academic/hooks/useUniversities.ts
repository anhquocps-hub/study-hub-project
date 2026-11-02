import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { academicApi } from '../api';

/** Danh sách trường cho ô chọn trường ở form đăng ký và form hồ sơ. */
export function useUniversities() {
  return useAsyncData('universities', (signal) => academicApi.getUniversities(signal));
}
