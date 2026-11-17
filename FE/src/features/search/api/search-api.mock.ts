// Mock Search API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với search-api.ts.
// Bài viết và cộng đồng lấy từ mock của feature tương ứng; người và nhóm dùng dữ liệu mẫu bên dưới.
import { ApiError } from '../../../services/http-client';
import { MOCK_UNIVERSITIES, mockDb } from '../../../test/mock-db';
import * as communitiesMock from '../../communities/api/communities-api.mock';
import { normalizeSearch } from '../../communities/model/community-schemas';
import * as postsMock from '../../posts/api/posts-api.mock';
import {
  filtersForTab,
  LEVEL_LABELS,
  ROLE_LABELS,
  type Group,
  type GroupStatus,
  type Person,
  type SearchCounts,
  type SearchFilters,
  type SearchItem,
  type SearchPage,
  type SearchTab,
} from '../model/search-schemas';
import { PAGE_SIZE, type SearchQuery } from './search-api';

type Seed<T> = T & { universityId: string | null; majorId: string | null; subjects: string[]; level?: string };

const PEOPLE: Seed<Person>[] = [
  { id: 'u-khac', fullName: 'Lê Hoàng Yến Nhi', avatarUrl: null, university: 'HCMUTE', major: 'Kỹ thuật phần mềm', cohort: 'K21', role: 'UI_UX', skills: ['Figma', 'React', 'User Research'], headline: 'UI/UX cho đồ án, thích làm design system.', universityId: 'hcmute', majorId: 'se', subjects: ['Đồ án Chuyên ngành 2', 'SE402'], level: 'ADVANCED' },
  { id: 'u-khai', fullName: 'Đỗ Quang Khải', avatarUrl: null, university: 'HCMUTE', major: 'Công nghệ thông tin', cohort: 'K22', role: 'FRONTEND', skills: ['React', 'Tailwind CSS', 'TypeScript'], headline: 'Đang tìm project React để lấy kinh nghiệm thực tế.', universityId: 'hcmute', majorId: 'cs', subjects: ['Lập trình Web nâng cao', 'SE302'], level: 'BEGINNER' },
  { id: 'u-bao', fullName: 'Trần Quốc Bảo', avatarUrl: null, university: 'HCMUTE', major: 'Công nghệ thông tin', cohort: 'K22', role: 'BACKEND', skills: ['SQL', 'PostgreSQL', 'Node.js'], headline: 'Ôn thi CSDL, mạnh phần truy vấn SQL.', universityId: 'hcmute', majorId: 'cs', subjects: ['Cơ sở dữ liệu', 'IT204'], level: 'INTERMEDIATE' },
  { id: 'u-tuan', fullName: 'Trần Minh Tuấn', avatarUrl: null, university: 'UIT', major: 'Kỹ thuật phần mềm', cohort: 'K21', role: 'BACKEND', skills: ['.NET 8', 'C#', 'PostgreSQL', 'Docker'], headline: 'Backend .NET, từng làm 2 đồ án Clean Architecture.', universityId: 'uit', majorId: 'se', subjects: ['Công nghệ phần mềm nâng cao', 'SE402'], level: 'ADVANCED' },
  { id: 'u-mai', fullName: 'Nguyễn Thị Mai', avatarUrl: null, university: 'UIT', major: 'Hệ thống thông tin', cohort: 'K22', role: 'UI_UX', skills: ['Figma', 'Prototyping'], headline: 'Thích thiết kế dashboard và biểu đồ.', universityId: 'uit', majorId: 'is', subjects: ['Cơ sở dữ liệu', 'IT204'], level: 'INTERMEDIATE' },
  { id: 'u-hai', fullName: 'Phạm Gia Hải', avatarUrl: null, university: 'HCMUT', major: 'Khoa học máy tính', cohort: 'K21', role: 'DATA_AI', skills: ['Python', 'PyTorch', 'SQL'], headline: 'Nghiên cứu Computer Vision, cần nhóm làm NCKH.', universityId: 'hcmut', majorId: 'cs', subjects: ['Trí tuệ nhân tạo', 'AI301'], level: 'ADVANCED' },
  { id: 'u-linh', fullName: 'Võ Khánh Linh', avatarUrl: null, university: 'HCMUS', major: 'Khoa học máy tính', cohort: 'K23', role: 'MOBILE', skills: ['Flutter', 'Dart', 'Firebase'], headline: 'Mobile developer, rảnh 10h/tuần.', universityId: 'hcmus', majorId: 'cs', subjects: ['Lập trình hướng đối tượng', 'OOP101'], level: 'BEGINNER' },
  { id: 'u-duc', fullName: 'Hoàng Minh Đức', avatarUrl: null, university: 'HCMUTE', major: 'Kỹ thuật phần mềm', cohort: 'K21', role: 'FULLSTACK', skills: ['React', 'Node.js', 'MongoDB'], headline: 'Fullstack JS, đang dẫn nhóm Expense Tracker.', universityId: 'hcmute', majorId: 'se', subjects: ['Lập trình Web nâng cao', 'SE302', 'Cơ sở dữ liệu', 'IT204'], level: 'INTERMEDIATE' },
  { id: 'u-thao', fullName: 'Lý Phương Thảo', avatarUrl: null, university: 'HCMUTE', major: 'Hệ thống thông tin', cohort: 'K23', role: 'TESTER', skills: ['Manual Test', 'Postman', 'Jest'], headline: 'Tester, muốn tham gia nhóm đồ án làm QA.', universityId: 'hcmute', majorId: 'is', subjects: ['Công nghệ phần mềm nâng cao', 'SE402'], level: 'BEGINNER' },
];

const GROUPS: Seed<Group & { classCode: string | null; lecturer: string | null; term: string | null; skills: string[]; roles: string[] }>[] = [
  { id: 'expense-tracker', name: 'Expense Tracker', kind: 'PROJECT', status: 'RECRUITING', memberCount: 2, maxMembers: 4, subject: 'Đồ án Chuyên ngành 2', university: 'HCMUTE', lookingFor: ['Backend .NET', 'UI/UX Designer'], isMember: true, universityId: 'hcmute', majorId: 'se', subjects: ['SE402'], classCode: 'SE402.N02', lecturer: 'TS. Nguyễn Thanh Hải', term: '2026-2027:HK1', skills: ['React', '.NET 8', 'PostgreSQL', 'Figma'], roles: ['BACKEND', 'UI_UX'], level: 'BEGINNER' },
  { id: 'on-thi-csdl', name: 'Ôn thi CSDL DB01', kind: 'STUDY', status: 'RECRUITING', memberCount: 3, maxMembers: 5, subject: 'Cơ sở dữ liệu', university: 'HCMUTE', lookingFor: ['Thành viên ôn thi giữa kỳ'], isMember: true, universityId: 'hcmute', majorId: 'cs', subjects: ['IT204'], classCode: 'DB01', lecturer: 'TS. Nguyễn Văn A', term: '2026-2027:HK1', skills: ['SQL'], roles: [], level: 'BEGINNER' },
  { id: 'web-se302-n01', name: 'Nhóm đồ án Web SE302.N01', kind: 'PROJECT', status: 'FULL', memberCount: 4, maxMembers: 4, subject: 'Lập trình Web nâng cao', university: 'HCMUTE', lookingFor: [], isMember: false, universityId: 'hcmute', majorId: 'se', subjects: ['SE302'], classCode: 'SE302.N01', lecturer: 'ThS. Lê Văn Bình', term: '2026-2027:HK1', skills: ['React', 'Node.js'], roles: ['FRONTEND', 'BACKEND'], level: 'INTERMEDIATE' },
  { id: 'cv-research', name: 'NCKH Computer Vision', kind: 'PROJECT', status: 'RECRUITING', memberCount: 2, maxMembers: 5, subject: 'Trí tuệ nhân tạo', university: 'HCMUT', lookingFor: ['Data / AI', 'Backend Python'], isMember: false, universityId: 'hcmut', majorId: 'cs', subjects: ['AI301'], classCode: null, lecturer: 'PGS. Trần Hữu Nghĩa', term: '2026-2027:HK2', skills: ['Python', 'PyTorch'], roles: ['DATA_AI', 'BACKEND'], level: 'ADVANCED' },
  { id: 'oop-study', name: 'Học nhóm OOP K23', kind: 'STUDY', status: 'CLOSED', memberCount: 6, maxMembers: 6, subject: 'Lập trình hướng đối tượng', university: 'HCMUS', lookingFor: [], isMember: false, universityId: 'hcmus', majorId: 'cs', subjects: ['OOP101'], classCode: 'OOP101.3', lecturer: null, term: '2025-2026:HK2', skills: ['Java'], roles: [], level: 'BEGINNER' },
  { id: 'mobile-flutter', name: 'App đặt lịch phòng lab (Flutter)', kind: 'PROJECT', status: 'RECRUITING', memberCount: 1, maxMembers: 3, subject: null, university: 'UIT', lookingFor: ['Mobile', 'Tester / QA'], isMember: false, universityId: 'uit', majorId: 'se', subjects: [], classCode: null, lecturer: null, term: null, skills: ['Flutter', 'Firebase'], roles: ['MOBILE', 'TESTER'], level: 'INTERMEDIATE' },
];

const has = (haystack: (string | null | undefined)[], needle?: string) =>
  !needle || normalizeSearch(haystack.filter(Boolean).join(' ')).includes(normalizeSearch(needle));

const shortNameOf = (universityId?: string) =>
  MOCK_UNIVERSITIES.find((item) => item.id === universityId)?.name.match(/\(([^)]+)\)/)?.[1];

function matchPerson(person: Seed<Person>, q: string, f: SearchFilters) {
  return (
    has([person.fullName, person.headline, person.major, ...person.skills], q) &&
    (!f.universityId || person.universityId === f.universityId) &&
    (!f.majorId || person.majorId === f.majorId) &&
    has(person.subjects, f.subject) &&
    has(person.skills, f.skill) &&
    has(person.skills, f.technology) &&
    (!f.role || person.role === f.role) &&
    (!f.level || person.level === f.level)
  );
}

function matchGroup(group: (typeof GROUPS)[number], q: string, f: SearchFilters) {
  return (
    has([group.name, group.subject, ...group.lookingFor, ...group.skills], q) &&
    (!f.universityId || group.universityId === f.universityId) &&
    (!f.majorId || group.majorId === f.majorId) &&
    has([group.subject, ...group.subjects], f.subject) &&
    has([group.classCode], f.classCode) &&
    has([group.lecturer], f.lecturer) &&
    (!f.term || group.term === f.term) &&
    has(group.skills, f.skill) &&
    has(group.skills, f.technology) &&
    (!f.role || group.roles.includes(f.role)) &&
    (!f.level || group.level === f.level) &&
    (!f.status || group.status === f.status)
  );
}

type Post = SearchItem['posts'];

function postStatus(post: Post): GroupStatus | null {
  if (!post.recruitment) return null;
  return post.recruitment.slotsFilled >= post.recruitment.slotsTotal ? 'FULL' : 'RECRUITING';
}

function matchPost(post: Post, q: string, f: SearchFilters) {
  const skills = [...post.tags, post.recruitment?.techStack, ...(post.seeking?.skills ?? [])];
  return (
    has([post.title, post.content, ...post.tags, post.course?.subject], q) &&
    // Mock chưa có mã trường/ngành trên bài viết: so tên trường viết tắt trong dòng giới thiệu tác giả
    (!f.universityId || has([post.author.headline, post.author.cohort], shortNameOf(f.universityId))) &&
    has([post.course?.subject, post.course?.classCode, post.recruitment?.courseLabel], f.subject) &&
    has([post.course?.classCode], f.classCode) &&
    has([post.course?.lecturer], f.lecturer) &&
    has(skills, f.skill) &&
    has(skills, f.technology) &&
    (!f.role || has([post.recruitment?.roles, ...(post.seeking?.skills ?? [])], ROLE_LABELS[f.role].split(' ')[0])) &&
    (!f.level || has([post.recruitment?.level], LEVEL_LABELS[f.level])) &&
    (!f.postType || post.type === f.postType) &&
    (!f.status || postStatus(post) === f.status)
  );
}

async function all(tab: SearchTab, q: string, filters: SearchFilters): Promise<SearchItem[SearchTab][]> {
  const f = filtersForTab(filters, tab);
  if (tab === 'people') return PEOPLE.filter((item) => matchPerson(item, q, f)).map(({ universityId: _u, majorId: _m, subjects: _s, level: _l, ...person }) => person);
  if (tab === 'groups')
    return GROUPS.filter((item) => matchGroup(item, q, f)).map((item) => ({
      id: item.id, name: item.name, kind: item.kind, status: item.status, memberCount: item.memberCount, maxMembers: item.maxMembers,
      subject: item.subject, university: item.university, lookingFor: item.lookingFor, isMember: item.isMember,
    }));
  if (tab === 'communities') {
    const [joined, discover] = await Promise.all([
      communitiesMock.listCommunities({ scope: 'joined' }),
      communitiesMock.listCommunities({ scope: 'discover' }),
    ]);
    return [...joined, ...discover].filter(
      (item) =>
        has([item.name, item.subjectCode, item.description, item.university?.shortName], q) &&
        (!f.universityId || item.university?.id === f.universityId) &&
        has([item.name, item.subjectCode], f.subject),
    );
  }
  return (await postsMock.listPosts()).filter((post) => matchPost(post, q, f));
}

export async function search<T extends SearchTab>(query: SearchQuery<T>, signal?: AbortSignal): Promise<SearchPage<T>> {
  await mockDb.delay(400);
  signal?.throwIfAborted();
  if (!mockDb.session.getUserId()) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  const q = query.q.trim();
  const tabs: SearchTab[] = ['posts', 'people', 'communities', 'groups'];
  const results = await Promise.all(tabs.map((tab) => all(tab, q, query.filters)));
  const counts = Object.fromEntries(tabs.map((tab, index) => [tab, results[index].length])) as SearchCounts;
  const list = results[tabs.indexOf(query.tab)];
  const offset = Number(query.cursor ?? 0) || 0;
  const items = list.slice(offset, offset + PAGE_SIZE) as SearchItem[T][];
  return { items, nextCursor: offset + PAGE_SIZE < list.length ? String(offset + PAGE_SIZE) : null, counts };
}
