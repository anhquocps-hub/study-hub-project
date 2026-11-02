import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { academicApi } from '../api';

/** Danh sách ngành của một trường; chưa chọn trường thì trả danh sách rỗng, không gọi API. */
export function useMajors(universityId: string) {
  return useAsyncData(`majors:${universityId}`, (signal) =>
    universityId === '' ? Promise.resolve([]) : academicApi.getMajors(universityId, signal),
  );
}
