// Dữ liệu trường mẫu, dùng khi VITE_USE_MOCK_API=true. Danh sách nằm ở src/test/mock-db.ts.
import { MOCK_MAJORS, MOCK_UNIVERSITIES, mockDb } from '../../../test/mock-db';
import type { Major, University } from '../model/academic-schemas';

export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  return MOCK_UNIVERSITIES;
}

export async function getMajors(universityId: string, signal?: AbortSignal): Promise<Major[]> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  return MOCK_MAJORS[universityId] ?? [];
}
