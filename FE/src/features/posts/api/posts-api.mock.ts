// Mock Post API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với posts-api.ts.
// Bài viết lưu trong sessionStorage giống mock-db: F5 vẫn còn, đóng tab là về dữ liệu mẫu.
import avatarKhai from '../../../assets/figma/avatar-quang-khai.png';
import avatarYenNhi from '../../../assets/figma/avatar-yen-nhi.png';
import { ApiError } from '../../../services/http-client';
import { mockDb } from '../../../test/mock-db';
import type { Post, PostInput } from '../model/post-schemas';
import type { PostQuery } from './posts-api';

const STORE_KEY = 'study-hub-mock-posts';
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const SEED: Post[] = [
  {
    id: 'post-expense-tracker',
    type: 'FIND_TEAMMATE',
    author: { id: 'u-khac', fullName: 'Lê Hoàng Yến Nhi', avatarUrl: avatarYenNhi, headline: 'HCMUTE • Khoa CNTT', cohort: 'K21' },
    title: 'Tuyển 1 Backend .NET & 1 UI/UX Designer cho dự án Expense Tracker (Web Quản lý chi tiêu sinh viên)',
    content:
      'Nhóm mình đã hoàn thiện spec dự án và wireframe luồng core (ghi chép thu chi, phân tích biểu đồ tháng, cảnh báo vượt ngân sách qua Zalo/Telegram bot). Cần tìm thêm 2 bạn cùng chí hướng cày đồ án để đạt target điểm A+ và chuẩn bị build profile portfolio.',
    tags: ['ReactJS', '.NET8', 'PostgreSQL', 'Figma', 'CleanArchitecture'],
    course: { subject: 'Đồ án Chuyên ngành 2', classCode: 'SE402.N02', semester: 'Học kỳ 1 / 2026-2027', lecturer: null },
    recruitment: {
      courseLabel: 'Đồ án Chuyên ngành 2 (Học kỳ 1 / 2026-2027)',
      techStack: 'React, Vite, .NET 8 WebAPI, PostgreSQL',
      roles: '01 Backend (.NET) • 01 UI Designer (Figma)',
      level: 'Beginner / Intermediate (Chăm chỉ, chịu code)',
      timeline: '2 tháng (Sprint 2 tuần/lần • Demo giữa kỳ)',
      slotsFilled: 2,
      slotsTotal: 4,
    },
    studyGroup: null,
    seeking: null,
    likeCount: 14,
    commentCount: 6,
    likedByMe: false,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'post-on-thi-csdl',
    type: 'FIND_STUDY_GROUP',
    author: { id: 'u-bao', fullName: 'Trần Quốc Bảo', avatarUrl: null, headline: 'K22 • CNTT', cohort: null },
    title: 'Lập nhóm 4-5 bạn ôn thi Giữa kỳ môn Cơ sở dữ liệu (Thầy Nguyễn Văn A - Lớp DB01)',
    content:
      'Chào mọi người, đợt thi giữa kỳ sắp tới thầy A báo sẽ có bài tập chuẩn hóa dạng 3NF và BCNF khá gắt, kèm viết câu truy vấn SQL lồng phức tạp. Mình lập nhóm nhỏ 5 người để cùng giải ngân hàng đề thi 3 năm gần nhất của trường và dò đáp án chéo.',
    tags: [],
    course: { subject: 'Cơ sở dữ liệu', classCode: 'DB01', semester: null, lecturer: 'TS. Nguyễn Văn A' },
    recruitment: null,
    studyGroup: {
      schedule: 'Tối T3 & T5 (20:00 - Online)',
      goal: 'Ôn tập đề thi giữa kỳ, giải trọn bộ bài tập SQL, cày điểm A môn học.',
    },
    seeking: null,
    likeCount: 14,
    commentCount: 6,
    likedByMe: false,
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'post-tim-project-react',
    type: 'FIND_PROJECT',
    author: { id: 'u-khai', fullName: 'Đỗ Quang Khải', avatarUrl: avatarKhai, headline: 'K22 • Khoa CNTT', cohort: null },
    title: 'Sinh viên K22 tìm project React / Web Frontend để lấy kinh nghiệm thực tế',
    content:
      'Mình vừa học xong React và Tailwind CSS, đã nắm vững luồng State Management cơ bản (Redux Toolkit, Zustand). Mình đang có 15 giờ rảnh rỗi mỗi tuần, mong muốn join nhóm làm đồ án môn học hoặc web mini-project nghiêm túc để rèn tay nghề và luyện cách merge code Git qua GitHub.',
    tags: [],
    course: null,
    recruitment: null,
    studyGroup: null,
    seeking: { skills: ['React.js (Component, Hooks)', 'Tailwind CSS', 'TypeScript (Cơ bản)'], availability: 'Rảnh 15h/tuần' },
    likeCount: 14,
    commentCount: 6,
    likedByMe: false,
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
  },
];

function load(): Post[] {
  const raw = sessionStorage.getItem(STORE_KEY);
  if (!raw) return structuredClone(SEED);
  try {
    return JSON.parse(raw) as Post[];
  } catch {
    return structuredClone(SEED);
  }
}

function save(posts: Post[]) {
  sessionStorage.setItem(STORE_KEY, JSON.stringify(posts));
}

function requireSession() {
  const userId = mockDb.session.getUserId();
  if (!userId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  return userId;
}

/** Giống BE: chỉ tác giả mới được sửa/xóa bài của mình. */
function findOwnPost(posts: Post[], postId: string, userId: string) {
  const post = posts.find((item) => item.id === postId);
  if (!post) throw new ApiError(404, 'Bài viết không tồn tại hoặc đã bị xóa.');
  if (post.author.id !== userId) throw new ApiError(403, 'Bạn không có quyền chỉnh sửa bài viết này.');
  return post;
}

function applyInput(input: PostInput): Pick<Post, 'type' | 'content' | 'tags' | 'course'> {
  return {
    type: input.type,
    content: input.content,
    tags: input.tags,
    course: input.subject
      ? { subject: input.subject, classCode: input.classCode, semester: input.semester, lecturer: input.lecturer }
      : null,
  };
}

export async function listPosts(query: PostQuery = {}, signal?: AbortSignal): Promise<Post[]> {
  await mockDb.delay(400);
  signal?.throwIfAborted();
  requireSession();
  const keyword = query.subject?.trim().toLowerCase();
  const posts = load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!keyword) return posts;
  return posts.filter((post) =>
    [post.course?.subject, post.course?.classCode, post.title, ...post.tags]
      .some((text) => text?.toLowerCase().includes(keyword)),
  );
}

export async function createPost(input: PostInput): Promise<Post> {
  await mockDb.delay(500);
  const userId = requireSession();
  const profile = mockDb.getProfile(userId);
  const now = new Date().toISOString();
  const post: Post = {
    id: crypto.randomUUID(),
    author: {
      id: userId,
      fullName: profile?.fullName ?? 'Bạn',
      avatarUrl: profile?.avatarUrl ?? null,
      headline: profile?.major?.name ?? null,
      cohort: profile?.cohort ?? null,
    },
    title: null,
    ...applyInput(input),
    recruitment: null,
    studyGroup: null,
    seeking: null,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    createdAt: now,
    updatedAt: now,
  };
  save([post, ...load()]);
  return post;
}

export async function updatePost(postId: string, input: PostInput): Promise<Post> {
  await mockDb.delay(500);
  const userId = requireSession();
  const posts = load();
  const post = findOwnPost(posts, postId, userId);
  Object.assign(post, applyInput(input), { updatedAt: new Date().toISOString() });
  save(posts);
  return post;
}

export async function deletePost(postId: string): Promise<void> {
  await mockDb.delay(400);
  const userId = requireSession();
  const posts = load();
  findOwnPost(posts, postId, userId);
  save(posts.filter((post) => post.id !== postId));
}

export async function toggleLike(postId: string): Promise<Post> {
  await mockDb.delay(150);
  requireSession();
  const posts = load();
  const post = posts.find((item) => item.id === postId);
  if (!post) throw new ApiError(404, 'Bài viết không tồn tại hoặc đã bị xóa.');
  post.likedByMe = !post.likedByMe;
  post.likeCount += post.likedByMe ? 1 : -1;
  save(posts);
  return post;
}
