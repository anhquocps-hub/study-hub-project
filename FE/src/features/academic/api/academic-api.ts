// Gọi Academic API thật của BE.
import { request } from '../../../services/http-client';
import { majorListSchema, universityListSchema, type Major, type University } from '../model/academic-schemas';

export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  return universityListSchema.parse(await request('/universities', { signal }));
}

export async function getMajors(universityId: string, signal?: AbortSignal): Promise<Major[]> {
  const query = new URLSearchParams({ universityId });
  return majorListSchema.parse(await request(`/majors?${query}`, { signal }));
}
