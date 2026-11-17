import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { academicApi } from '../api';

/** Môn học của ngành; chưa chọn đủ trường và ngành thì trả danh sách rỗng, không gọi API. */
export function useSubjects(universityId: string, majorId: string) {
  return useAsyncData(`subjects:${universityId}:${majorId}`, (signal) =>
    universityId === '' || majorId === ''
      ? Promise.resolve([])
      : academicApi.getSubjects(universityId, majorId, signal),
  );
}
