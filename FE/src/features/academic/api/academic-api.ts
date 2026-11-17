// Gọi Academic API thật của BE.
import { request } from '../../../services/http-client';
import {
  majorListSchema,
  myAcademicSchema,
  subjectListSchema,
  universityListSchema,
  type AcademicFormValues,
  type Major,
  type MyAcademic,
  type Subject,
  type University,
} from '../model/academic-schemas';

export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  return universityListSchema.parse(await request('/universities', { signal }));
}

export async function getMajors(universityId: string, signal?: AbortSignal): Promise<Major[]> {
  const query = new URLSearchParams({ universityId });
  return majorListSchema.parse(await request(`/majors?${query}`, { signal }));
}

/** Môn học thuộc ngành của một trường. */
export async function getSubjects(universityId: string, majorId: string, signal?: AbortSignal): Promise<Subject[]> {
  const query = new URLSearchParams({ universityId, majorId });
  return subjectListSchema.parse(await request(`/subjects?${query}`, { signal }));
}

export async function getMyAcademic(signal?: AbortSignal): Promise<MyAcademic> {
  return myAcademicSchema.parse(await request('/profiles/me/academic', { signal }));
}

/** Lưu trường, ngành, môn đang học; BE cập nhật profileCompleted của người dùng. */
export async function saveMyAcademic(input: AcademicFormValues): Promise<MyAcademic> {
  const data = await request('/profiles/me/academic', { method: 'PUT', body: JSON.stringify(input) });
  return myAcademicSchema.parse(data);
}
