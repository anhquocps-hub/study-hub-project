// Gọi Academic API thật của BE.
import { request } from '../../../services/http-client';
import { universityListSchema, type University } from '../model/academic-schemas';

export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  return universityListSchema.parse(await request('/universities', { signal }));
}
