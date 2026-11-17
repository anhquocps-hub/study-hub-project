// Dữ liệu học thuật mẫu, dùng khi VITE_USE_MOCK_API=true. Danh sách nằm ở src/test/mock-db.ts.
import { ApiError } from '../../../services/http-client';
import { MOCK_MAJORS, MOCK_SUBJECTS, MOCK_UNIVERSITIES, mockDb } from '../../../test/mock-db';
import type { AcademicFormValues, Major, MyAcademic, Subject, University } from '../model/academic-schemas';

/** Môn đang học của từng người (userId → mã môn), lưu riêng vì Profile chưa có trường này. */
const SUBJECTS_KEY = 'study-hub-mock-my-subjects';

function loadMySubjects(): Record<string, string[]> {
  try {
    return JSON.parse(sessionStorage.getItem(SUBJECTS_KEY) ?? '{}') as Record<string, string[]>;
  } catch {
    return {};
  }
}

function requireSession() {
  const userId = mockDb.session.getUserId();
  if (!userId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  return userId;
}

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

export async function getSubjects(universityId: string, majorId: string, signal?: AbortSignal): Promise<Subject[]> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  const majorBelongs = (MOCK_MAJORS[universityId] ?? []).some((major) => major.id === majorId);
  return majorBelongs ? (MOCK_SUBJECTS[majorId] ?? []) : [];
}

export async function getMyAcademic(signal?: AbortSignal): Promise<MyAcademic> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  const userId = requireSession();
  const profile = mockDb.getProfile(userId);
  return {
    universityId: profile?.university?.id ?? null,
    majorId: profile?.major?.id ?? null,
    subjectIds: loadMySubjects()[userId] ?? [],
  };
}

export async function saveMyAcademic(input: AcademicFormValues): Promise<MyAcademic> {
  await mockDb.delay(600);
  const userId = requireSession();
  const profile = mockDb.getProfile(userId);
  if (!profile) throw new ApiError(404, 'Không tìm thấy người dùng.');

  // Kiểm tra giống BE: dữ liệu phải thuộc đúng trường/ngành
  const university = MOCK_UNIVERSITIES.find((item) => item.id === input.universityId);
  if (!university) throw new ApiError(400, 'Dữ liệu không hợp lệ.', { universityId: 'Trường không tồn tại.' });
  const major = (MOCK_MAJORS[input.universityId] ?? []).find((item) => item.id === input.majorId);
  if (!major) throw new ApiError(400, 'Dữ liệu không hợp lệ.', { majorId: 'Ngành không thuộc trường đã chọn.' });
  const validIds = new Set((MOCK_SUBJECTS[input.majorId] ?? []).map((subject) => subject.id));
  if (input.subjectIds.some((id) => !validIds.has(id)))
    throw new ApiError(400, 'Dữ liệu không hợp lệ.', { subjectIds: 'Có môn không thuộc ngành đã chọn.' });

  mockDb.saveProfile({ ...profile, university, major });
  sessionStorage.setItem(SUBJECTS_KEY, JSON.stringify({ ...loadMySubjects(), [userId]: input.subjectIds }));
  return { universityId: university.id, majorId: major.id, subjectIds: input.subjectIds };
}
