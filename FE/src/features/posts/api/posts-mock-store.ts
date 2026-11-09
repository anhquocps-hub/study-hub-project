// Kho dữ liệu giả dùng chung cho posts-api.mock.ts và comments-api.mock.ts (chỉ khi VITE_USE_MOCK_API=true).
// Lưu trong sessionStorage giống mock-db: F5 vẫn còn, đóng tab là về dữ liệu mẫu.
// Bài viết và bình luận chung một kho để commentCount luôn khớp với số bình luận thật.
import avatarKhai from '../../../assets/figma/avatar-quang-khai.png';
import avatarYenNhi from '../../../assets/figma/avatar-yen-nhi.png';
import { ApiError } from '../../../services/http-client';
import type { Page } from '../../../shared/lib/pagination';
import { mockDb } from '../../../test/mock-db';
import type { Comment } from '../model/comment-schemas';
import type { Post } from '../model/post-schemas';

const POSTS_KEY = 'unispace-mock-posts';
const COMMENTS_KEY = 'unispace-mock-comments';
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const YEN_NHI = { id: 'u-khac', fullName: 'Lê Hoàng Yến Nhi', avatarUrl: avatarYenNhi };
const BAO = { id: 'u-bao', fullName: 'Trần Quốc Bảo', avatarUrl: null };
const KHAI = { id: 'u-khai', fullName: 'Đỗ Quang Khải', avatarUrl: avatarKhai };
const MAI = { id: 'u-mai', fullName: 'Phạm Ngọc Mai', avatarUrl: null };

type SeedPost = Omit<Post, 'commentCount' | 'likedByMe' | 'updatedAt' | 'studyGroup' | 'seeking' | 'recruitment' | 'course'> &
  Partial<Pick<Post, 'studyGroup' | 'seeking' | 'recruitment' | 'course'>>;

const SEED_POSTS: SeedPost[] = [
  {
    id: 'post-expense-tracker',
    type: 'FIND_TEAMMATE',
    author: { ...YEN_NHI, headline: 'HCMUTE • Khoa CNTT', cohort: 'K21' },
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
    likeCount: 14,
    createdAt: hoursAgo(2),
  },
  {
    id: 'post-on-thi-csdl',
    type: 'FIND_STUDY_GROUP',
    author: { ...BAO, headline: 'K22 • CNTT', cohort: null },
    title: 'Lập nhóm 4-5 bạn ôn thi Giữa kỳ môn Cơ sở dữ liệu (Thầy Nguyễn Văn A - Lớp DB01)',
    content:
      'Chào mọi người, đợt thi giữa kỳ sắp tới thầy A báo sẽ có bài tập chuẩn hóa dạng 3NF và BCNF khá gắt, kèm viết câu truy vấn SQL lồng phức tạp. Mình lập nhóm nhỏ 5 người để cùng giải ngân hàng đề thi 3 năm gần nhất của trường và dò đáp án chéo.',
    tags: [],
    course: { subject: 'Cơ sở dữ liệu', classCode: 'DB01', semester: null, lecturer: 'TS. Nguyễn Văn A' },
    studyGroup: {
      schedule: 'Tối T3 & T5 (20:00 - Online)',
      goal: 'Ôn tập đề thi giữa kỳ, giải trọn bộ bài tập SQL, cày điểm A môn học.',
    },
    likeCount: 9,
    createdAt: hoursAgo(4),
  },
  {
    id: 'post-tim-project-react',
    type: 'FIND_PROJECT',
    author: { ...KHAI, headline: 'K22 • Khoa CNTT', cohort: null },
    title: 'Sinh viên K22 tìm project React / Web Frontend để lấy kinh nghiệm thực tế',
    content:
      'Mình vừa học xong React và Tailwind CSS, đã nắm vững luồng State Management cơ bản (Redux Toolkit, Zustand). Mình đang có 15 giờ rảnh rỗi mỗi tuần, mong muốn join nhóm làm đồ án môn học hoặc web mini-project nghiêm túc để rèn tay nghề và luyện cách merge code Git qua GitHub.',
    tags: [],
    seeking: { skills: ['React.js (Component, Hooks)', 'Tailwind CSS', 'TypeScript (Cơ bản)'], availability: 'Rảnh 15h/tuần' },
    likeCount: 6,
    createdAt: hoursAgo(6),
  },
  {
    id: 'post-hoi-docker',
    type: 'QUESTION',
    author: { ...MAI, headline: 'UIT • Hệ thống thông tin', cohort: 'K20' },
    title: 'Docker Compose báo lỗi "port is already allocated" khi chạy PostgreSQL?',
    content:
      'Mình chạy docker compose up thì container db không lên, log báo cổng 5432 đã bị chiếm. Máy mình có cài PostgreSQL bản Windows trước đó. Có cách nào chạy song song mà không phải gỡ bản cài sẵn không mọi người?',
    tags: ['Docker', 'PostgreSQL'],
    likeCount: 3,
    createdAt: hoursAgo(9),
  },
  {
    id: 'post-chia-se-tai-lieu',
    type: 'GENERAL',
    author: { ...YEN_NHI, headline: 'HCMUTE • Khoa CNTT', cohort: 'K21' },
    title: null,
    content:
      'Chia sẻ với mọi người bộ slide tự tổng hợp môn Lập trình Web (HTML/CSS → React → REST API). Ai cần thì comment, mình gửi link Drive nhé. Chúc mọi người thi tốt!',
    tags: ['LapTrinhWeb', 'TaiLieu'],
    likeCount: 21,
    createdAt: hoursAgo(26),
  },
  {
    id: 'post-review-mon-hoc',
    type: 'GENERAL',
    author: { ...KHAI, headline: 'K22 • Khoa CNTT', cohort: null },
    title: null,
    content:
      'Kỳ này nên đăng ký Công nghệ phần mềm chuyên sâu hay Kiểm thử phần mềm trước nhỉ? Mình định theo hướng QA nhưng vẫn muốn giữ nền tảng dev vững.',
    tags: [],
    likeCount: 2,
    createdAt: hoursAgo(50),
  },
];

const SEED_COMMENTS: Comment[] = [
  seedComment('c-1', 'post-expense-tracker', null, BAO, 'Mình làm .NET được 1 năm rồi, có thể xem spec trước không bạn?', 1.8),
  seedComment('c-1-1', 'post-expense-tracker', 'c-1', YEN_NHI, 'Được nè, mình nhắn tin gửi link Notion cho bạn nhé.', 1.6),
  seedComment('c-2', 'post-expense-tracker', null, MAI, 'Team còn nhận Designer không ạ? Mình có portfolio Figma.', 1.2),
  seedComment('c-3', 'post-on-thi-csdl', null, KHAI, 'Cho mình 1 slot với, mình đang yếu phần chuẩn hóa.', 3.5),
  seedComment('c-3-1', 'post-on-thi-csdl', 'c-3', BAO, 'Ok bạn, tối T3 vào phòng Meet nhé.', 3.2),
  seedComment('c-3-2', 'post-on-thi-csdl', 'c-3', MAI, 'Mình cũng muốn tham gia luôn!', 3),
  seedComment('c-4', 'post-hoi-docker', null, BAO, 'Đổi port bên trái trong compose thành "5433:5432" rồi sửa DATABASE_URL là được.', 8),
  seedComment('c-5', 'post-chia-se-tai-lieu', null, KHAI, 'Xin link với ạ, cảm ơn bạn nhiều!', 20),
];

function seedComment(
  id: string,
  postId: string,
  parentId: string | null,
  author: Comment['author'],
  content: string,
  hours: number,
): Comment {
  const at = hoursAgo(hours);
  return { id, postId, parentId, author, content, replyCount: 0, createdAt: at, updatedAt: at };
}

function buildSeed(): { posts: Post[]; comments: Comment[] } {
  const comments = structuredClone(SEED_COMMENTS);
  for (const comment of comments) {
    comment.replyCount = comments.filter((item) => item.parentId === comment.id).length;
  }
  const posts = SEED_POSTS.map<Post>((seed) => ({
    course: null,
    recruitment: null,
    studyGroup: null,
    seeking: null,
    ...structuredClone(seed),
    commentCount: comments.filter((comment) => comment.postId === seed.id).length,
    likedByMe: false,
    updatedAt: seed.createdAt,
  }));
  return { posts, comments };
}

function read<T>(key: string): T[] | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : null;
  } catch {
    return null; // dữ liệu hỏng: dùng lại dữ liệu mẫu
  }
}

export const mockStore = {
  load(): { posts: Post[]; comments: Comment[] } {
    const posts = read<Post>(POSTS_KEY);
    const comments = read<Comment>(COMMENTS_KEY);
    return posts && comments ? { posts, comments } : buildSeed();
  },
  save(data: { posts: Post[]; comments: Comment[] }) {
    sessionStorage.setItem(POSTS_KEY, JSON.stringify(data.posts));
    sessionStorage.setItem(COMMENTS_KEY, JSON.stringify(data.comments));
  },
};

export function requireSession(): string {
  const userId = mockDb.session.getUserId();
  if (!userId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  return userId;
}

export function findPost(posts: Post[], postId: string): Post {
  const post = posts.find((item) => item.id === postId);
  if (!post) throw new ApiError(404, 'Bài viết không tồn tại hoặc đã bị xóa.');
  return post;
}

const keyOf = (item: { createdAt: string; id: string }) => `${item.createdAt}|${item.id}`;

/**
 * Phân trang kiểu keyset giống BE: cursor = (createdAt, id) của phần tử cuối trang trước.
 * Nhờ vậy thêm/xóa phần tử giữa chừng không làm trang sau bị trùng hoặc sót.
 */
export function paginate<T extends { createdAt: string; id: string }>(
  items: T[],
  order: 'asc' | 'desc',
  cursor: string | null | undefined,
  limit: number,
): Page<T> {
  const sign = order === 'asc' ? 1 : -1;
  const sorted = [...items].sort((a, b) => sign * keyOf(a).localeCompare(keyOf(b)));
  const rest = cursor ? sorted.filter((item) => sign * keyOf(item).localeCompare(cursor) > 0) : sorted;
  const page = rest.slice(0, limit);
  return { items: page, nextCursor: rest.length > limit ? keyOf(page[page.length - 1]) : null };
}

let lastTimestamp = 0;

/** Thời điểm hiện tại nhưng luôn tăng dần, để các bản ghi tạo liên tiếp trong cùng 1ms vẫn có thứ tự rõ ràng. */
export function nowIso(): string {
  lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
  return new Date(lastTimestamp).toISOString();
}
