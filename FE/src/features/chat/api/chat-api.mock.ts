// Mock Chat API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với chat-api.ts.
// shortcut: tin nhắn chỉ nằm trong bộ nhớ (F5 là mất tin vừa gửi); đủ cho demo giao diện.
import avatarKhoa from '../../../assets/figma/avatar-khoa.png';
import avatarLeNam from '../../../assets/figma/avatar-le-nam.png';
import avatarMai from '../../../assets/figma/avatar-mai.png';
import avatarMai2 from '../../../assets/figma/avatar-mai-2.png';
import avatarThayA from '../../../assets/figma/avatar-thay-a.png';
import avatarTuan from '../../../assets/figma/avatar-tran-tuan.png';
import { ApiError } from '../../../services/http-client';
import { mockDb } from '../../../test/mock-db';
import type { Channel, ChatEvent, ChatRoom, Message, RoomSummary } from '../model/chat-schemas';

const ch = (id: string, name: string, extra: Partial<Channel> = {}): Channel => ({
  id, name, icon: null, emoji: null, badge: null, hasUnread: false, ...extra,
});

const LE_NAM = { id: 'u-le-nam', fullName: 'Lê Nam', avatarUrl: avatarLeNam };
const TUAN = { id: 'u-tran-tuan', fullName: 'Trần Minh Tuấn', avatarUrl: avatarTuan };
const MAI = { id: 'u-mai', fullName: 'Nguyễn Thị Mai', avatarUrl: avatarMai };
const THAY_A = { id: 'u-thay-a', fullName: 'ThS. Nguyễn Văn A', avatarUrl: avatarThayA };
const KHOA = { id: 'u-khoa', fullName: 'Đặng Khoa', avatarUrl: avatarKhoa };

const ROOMS: ChatRoom[] = [
  {
    id: 'expense-tracker',
    kind: 'SPACE',
    name: 'Expense Tracker',
    badge: { text: 'ĐỒ ÁN', tone: 'green' },
    subtitle: 'Kỳ 1 • Nhóm 04 (HCMUTE)',
    description: '',
    channelGroups: [
      {
        id: 'g-info',
        name: 'Thông tin chung',
        channels: [
          ch('et-chung', 'chung', { icon: 'hash', hasUnread: true }),
          ch('et-ghim', 'thong-bao-ghim', { icon: 'pin', badge: { text: '3', tone: 'muted' } }),
          ch('et-tv', 'thanh-vien-nhom', { icon: 'members', badge: { text: '4', tone: 'green' } }),
          ch('et-lk', 'lien-ket-nhom', { icon: 'link', badge: { text: '5', tone: 'accent' } }),
          ch('et-api', 'tai-lieu-api', { icon: 'folder' }),
        ],
      },
      {
        id: 'g-roles',
        name: 'Phân công & Chuyên môn',
        channels: [
          ch('et-fe', 'frontend-react', { icon: 'terminal', badge: { text: 'v1.2', tone: 'purple' } }),
          ch('et-be', 'backend-dotnet', { icon: 'server' }),
          ch('et-ui', 'ui-ux-design', { icon: 'palette' }),
        ],
      },
    ],
    memberCount: 4,
    memberPreview: [LE_NAM, TUAN, MAI],
    pinnedCount: 3,
    pinned: null,
    highlights: [],
  },
  {
    id: 'csdl-db01',
    kind: 'COMMUNITY',
    name: 'Cơ sở dữ liệu',
    badge: { text: 'IT204', tone: 'solid' },
    subtitle: 'Khoa CNTT - HCMUTE • HK2 (2026-2027)',
    description:
      'Không gian học tập trung tâm môn Cơ sở dữ liệu (Database Systems - IT204). Nơi trao đổi học thuật, thông báo tiến độ bài tập lớn, giải đáp kỹ thuật SQL/NoSQL và chuẩn hóa dữ liệu cùng Giảng viên và Trợ giảng.',
    channelGroups: [
      {
        id: 'c-info',
        name: 'Thông tin & Quy chuẩn',
        channels: [
          ch('db-general', 'general-csdl', { hasUnread: true }),
          ch('db-info', 'thong-tin-mon-hoc', { emoji: 'ℹ️', badge: { text: '3 TC', tone: 'muted' } }),
          ch('db-pin', 'tai-nguyen-ghim', { emoji: '📌', badge: { text: '8', tone: 'accent' } }),
          ch('db-ta', 'giang-vien-tro-giang', { emoji: '👥', badge: { text: '2', tone: 'purple' } }),
          ch('db-noti', 'thong-bao-giang-vien', { icon: 'megaphone', badge: { text: '2', tone: 'red' } }),
          ch('db-deadline', 'de-cuong-deadline', { icon: 'calendar' }),
        ],
      },
      {
        id: 'c-talk',
        name: 'Thảo luận học thuật',
        channels: [
          ch('db-midterm', 'on-thi-giua-ky', { emoji: '🔥', badge: { text: 'Hot', tone: 'red' } }),
          ch('db-sql', 'hoi-dap-sql-nosql'),
          ch('db-ask-ta', 'giai-dap-cung-ta', { badge: { text: 'TA', tone: 'accent' } }),
        ],
      },
      {
        id: 'c-team',
        name: 'Tìm đồng đội & Đồ án',
        channels: [
          ch('db-team', 'tim-team-do-an-lon', { badge: { text: 'Tuyển', tone: 'green' } }),
          ch('db-share', 'chia-se-source-tai-lieu'),
        ],
      },
    ],
    memberCount: 1240,
    memberPreview: [THAY_A, KHOA, LE_NAM],
    pinnedCount: 8,
    pinned: {
      authorName: 'ThS. Nguyễn Văn A',
      text: 'Hạn nộp bài tập lớn EERD (23:59 CN tuần 8) & Bộ tài liệu ôn tập Giữa kỳ 120 câu hỏi truy vấn.',
    },
    highlights: [
      { icon: 'abet', text: 'Chuẩn đầu ra ABET' },
      { icon: 'syllabus', text: 'Đề cương 15 tuần' },
      { icon: 'rules', text: 'Quy chuẩn thảo luận văn minh' },
    ],
  },
];

/** Phòng chưa có dữ liệu chi tiết: dựng khung tối thiểu để vẫn mở được. */
function simpleRoom(summary: RoomSummary): ChatRoom {
  return {
    ...summary,
    subtitle: 'HCMUTE • HK1 (2026-2027)',
    description: `Không gian trao đổi của ${summary.name}.`,
    channelGroups: [{ id: 'g', name: 'Thông tin chung', channels: [ch(`${summary.id}-general`, 'general')] }],
    memberCount: 1,
    memberPreview: [],
    pinnedCount: 0,
    pinned: null,
    highlights: [],
  };
}

const MY_ROOMS: RoomSummary[] = [
  { id: 'csdl-db01', kind: 'COMMUNITY', name: 'Cơ sở dữ liệu (CSDL DB01)', badge: { text: 'HCMUTE', tone: 'muted' } },
  { id: 'web-nang-cao', kind: 'COMMUNITY', name: 'Lập trình Web Nâng cao', badge: { text: 'SE302', tone: 'purple' } },
  { id: 'dsa', kind: 'COMMUNITY', name: 'Cấu trúc dữ liệu & Giải thuật', badge: { text: 'DSA', tone: 'green' } },
  { id: 'expense-tracker', kind: 'SPACE', name: 'Expense Tracker', badge: { text: 'Project', tone: 'green' } },
  { id: 'on-thi-csdl', kind: 'SPACE', name: 'Ôn thi CSDL DB01', badge: { text: 'Study', tone: 'purple' } },
];

const today = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

const MESSAGES: Message[] = [
  {
    id: 'm-sys', channelId: 'et-chung', author: null, attachment: null, reactions: [], createdAt: today('10:14'),
    content:
      '🎉 Không gian nhóm đã được tạo tự động sau khi Lê Nam duyệt Trần Minh Tuấn. Tất cả tài liệu và kênh phân quyền ban đầu đã sẵn sàng. Chào mừng các bạn vào team!',
  },
  {
    id: 'm-1', channelId: 'et-chung', author: { ...LE_NAM, role: { text: 'LEADER', tone: 'accent' } },
    attachment: null, reactions: [], createdAt: today('10:15'),
    content:
      'Chào Tuấn và Mai nhé! Tối nay 20h team mình họp online trên Google Meet để chốt DB schema và phân chia task sprint 1 nhé. Mai nhớ chuẩn bị màn Luồng thanh toán ví điện tử nhé.',
  },
  {
    id: 'm-2', channelId: 'et-chung', author: { ...TUAN, role: { text: 'BACKEND', tone: 'purple' } },
    reactions: [], createdAt: today('10:17'),
    content:
      'Dạ vâng anh Nam! Em vừa xem qua wireframe, em đã dựng sẵn base ASP.NET Core 8 Web API và kết nối PostgreSQL rồi ạ. Em cấu hình JWT Auth theo format này nhé:',
    attachment: {
      kind: 'code',
      fileName: 'appsettings.Development.json',
      code: `{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=ExpenseTrackerDb;Username=postgres;"
  },
  "JwtSettings": {
    "Issuer": "UniSpace-AuthServer",
    "ExpiryMinutes": 120
  }
}`,
    },
  },
  {
    id: 'm-3', channelId: 'et-chung', author: { ...MAI, role: { text: 'UI/UX', tone: 'green' } },
    reactions: [], createdAt: today('10:20'),
    content:
      'Em cũng vừa cập nhật bản Figma prototype cho Dashboard và biểu đồ phân loại thu chi tuần rồi nhé mọi người. Anh Nam và Tuấn review thử:',
    attachment: { kind: 'link', title: 'Expense Tracker - UI Workspace v2.4', url: 'figma.com/@mai.design/expense-tracker-system' },
  },
  {
    id: 'm-4', channelId: 'db-general', author: { ...THAY_A, role: { text: 'GIẢNG VIÊN / OWNER', tone: 'solid' } },
    createdAt: today('09:15'),
    content:
      'Chào các bạn lớp IT204! Thầy đã tổng hợp bảng phân biệt trực quan giữa Dạng chuẩn 3 (3NF) và Dạng chuẩn Boyce-Codd (BCNF).\n\nLưu ý trọng tâm ôn thi: Mọi quan hệ đạt BCNF đều đạt 3NF, nhưng chiều ngược lại không nhất thiết đúng. Trong bài thi trắc nghiệm và tự luận, khi phân rã về BCNF cần kiểm tra kỹ tính chất bảo toàn phụ thuộc hàm (F preservation). Nếu làm mất phụ thuộc hàm quan trọng, ta thường chấp nhận giữ ở mức 3NF.',
    attachment: { kind: 'file', fileName: 'Tom_tat_chuan_hoa_3NF_BCNF.pdf', meta: '1.4 MB • Tài liệu ôn tập Giữa kỳ IT204', ext: 'PDF' },
    reactions: [{ emoji: '❤️', count: 24 }, { emoji: '💡', count: 19 }, { emoji: '🎯', count: 7 }],
  },
  {
    id: 'm-5', channelId: 'db-general', author: { ...KHOA, role: { text: 'TRỢ GIẢNG / TA', tone: 'purple' } },
    createdAt: today('09:42'),
    content:
      'Dành cho các bạn đang hoàn thiện câu hỏi bài lab số 4: Đây là mẫu tối ưu cho câu hỏi "Tìm sinh viên có điểm trung bình tích lũy môn chuyên ngành > 8.0 và tổng số tín chỉ hoàn thành >= 50". Tránh dùng SUBQUERY lồng nhau trong mệnh đề WHERE vì sẽ gây full-table scan:',
    attachment: {
      kind: 'code',
      fileName: 'query_optimization.sql',
      code: `SELECT
    s.student_id,
    s.full_name,
    COUNT(e.course_id) AS total_courses,
    SUM(c.credits) AS completed_credits,
    ROUND(AVG(e.grade), 2) AS gpa
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
INNER JOIN courses c ON e.course_id = c.course_id
WHERE e.status = 'PASSED'
  AND c.department_id = 'CNTT'
GROUP BY s.student_id, s.full_name
HAVING SUM(c.credits) >= 50
   AND AVG(e.grade) > 8.0
ORDER BY gpa DESC;`,
    },
    reactions: [{ emoji: '🔥', count: 31 }, { emoji: '🙏', count: 15 }],
  },
  {
    id: 'm-6', channelId: 'db-general',
    author: { id: 'u-mai-2', fullName: 'Nguyễn Thị Mai', avatarUrl: avatarMai2, role: { text: 'Sinh viên K22', tone: 'muted' } },
    attachment: null, reactions: [], createdAt: today('10:05'),
    content: 'Thầy ơi cho em hỏi thêm về cách tìm Minimal Cover (Phủ tối thiểu) khi tập F có phụ thuộc hàm dư thừa ạ?',
  },
];

const listeners = new Map<string, Set<(event: ChatEvent) => void>>();
const emit = (channelId: string, event: ChatEvent) => listeners.get(channelId)?.forEach((fn) => fn(event));

function requireSession() {
  const userId = mockDb.session.getUserId();
  if (!userId) throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  return userId;
}

export async function getMyRooms(signal?: AbortSignal): Promise<RoomSummary[]> {
  await mockDb.delay(200);
  signal?.throwIfAborted();
  requireSession();
  return MY_ROOMS;
}

export async function getRoom(kind: ChatRoom['kind'], roomId: string, signal?: AbortSignal): Promise<ChatRoom> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  requireSession();
  const room = ROOMS.find((item) => item.id === roomId && item.kind === kind);
  if (room) return room;
  const summary = MY_ROOMS.find((item) => item.id === roomId && item.kind === kind);
  if (!summary) throw new ApiError(404, kind === 'SPACE' ? 'Không tìm thấy nhóm.' : 'Không tìm thấy cộng đồng.');
  return simpleRoom(summary);
}

export async function getMessages(channelId: string, signal?: AbortSignal): Promise<Message[]> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  requireSession();
  return MESSAGES.filter((message) => message.channelId === channelId);
}

export async function sendMessage(channelId: string, content: string): Promise<Message> {
  await mockDb.delay(150);
  const userId = requireSession();
  const profile = mockDb.getProfile(userId);
  const message: Message = {
    id: crypto.randomUUID(),
    channelId,
    author: { id: userId, fullName: profile?.fullName ?? 'Bạn', avatarUrl: profile?.avatarUrl ?? null, role: null },
    content,
    attachment: null,
    reactions: [],
    createdAt: new Date().toISOString(),
  };
  MESSAGES.push(message);
  simulateReply(channelId);
  return message;
}

/** Giả lập một thành viên khác đang gõ rồi trả lời, để thấy luồng realtime hoạt động. */
function simulateReply(channelId: string) {
  const replier = channelId.startsWith('db-') ? KHOA : LE_NAM;
  setTimeout(() => emit(channelId, { type: 'TYPING_START', channelId, userName: replier.fullName }), 600);
  setTimeout(() => {
    emit(channelId, { type: 'TYPING_STOP', channelId, userName: replier.fullName });
    const reply: Message = {
      id: crypto.randomUUID(),
      channelId,
      author: { ...replier, role: null },
      content: 'Đã nhận nhé 👍',
      attachment: null,
      reactions: [],
      createdAt: new Date().toISOString(),
    };
    MESSAGES.push(reply);
    emit(channelId, { type: 'MESSAGE_SENT', message: reply });
  }, 2200);
}

export function subscribe(channelId: string, onEvent: (event: ChatEvent) => void): () => void {
  const set = listeners.get(channelId) ?? new Set();
  set.add(onEvent);
  listeners.set(channelId, set);
  return () => set.delete(onEvent);
}
