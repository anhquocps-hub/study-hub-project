/**
 * Cộng đồng mẫu dùng chung cho communities-api.mock.ts và chat-api.mock.ts.
 * Trạng thái tham gia của từng người lưu trong sessionStorage (F5 vẫn còn, đóng tab là về mặc định).
 */
import type { Community, Membership } from '../features/communities';

export type CommunitySeed = Omit<Community, 'membership' | 'canJoin'>;

const HCMUTE = { id: 'hcmute', shortName: 'HCMUTE' };
const UIT = { id: 'uit', shortName: 'UIT' };
const HCMUT = { id: 'hcmut', shortName: 'HCMUT' };

export const MOCK_COMMUNITIES: CommunitySeed[] = [
  {
    id: 'csdl-db01',
    name: 'Cơ sở dữ liệu (CSDL DB01)',
    type: 'SUBJECT',
    visibility: 'SCHOOL_ONLY',
    university: HCMUTE,
    subjectCode: 'IT204',
    memberCount: 1240,
    description: 'Trao đổi bài tập lớn, giải đáp SQL/NoSQL và chuẩn hóa dữ liệu cùng giảng viên, trợ giảng môn IT204.',
  },
  {
    id: 'web-nang-cao',
    name: 'Lập trình Web Nâng cao',
    type: 'SUBJECT',
    visibility: 'PUBLIC',
    university: HCMUTE,
    subjectCode: 'SE302',
    memberCount: 486,
    description: 'React, Node.js, triển khai web và review đồ án môn SE302.',
  },
  {
    id: 'dsa',
    name: 'Cấu trúc dữ liệu & Giải thuật',
    type: 'SUBJECT',
    visibility: 'PUBLIC',
    university: HCMUTE,
    subjectCode: 'DSA201',
    memberCount: 932,
    description: 'Luyện giải thuật, chia sẻ đề thi và lời giải các năm trước.',
  },
  {
    id: 'sv-hcmute',
    name: 'Sinh viên HCMUTE',
    type: 'UNIVERSITY',
    visibility: 'SCHOOL_ONLY',
    university: HCMUTE,
    subjectCode: null,
    memberCount: 15320,
    description: 'Cộng đồng chung của sinh viên ĐH Sư phạm Kỹ thuật TP.HCM: thông báo, sự kiện, hỏi đáp.',
  },
  {
    id: 'sv-uit',
    name: 'Sinh viên UIT',
    type: 'UNIVERSITY',
    visibility: 'SCHOOL_ONLY',
    university: UIT,
    subjectCode: null,
    memberCount: 11870,
    description: 'Cộng đồng chung của sinh viên ĐH Công nghệ Thông tin – ĐHQG-HCM.',
  },
  {
    id: 'hdh-hcmut',
    name: 'Hệ điều hành (HCMUT)',
    type: 'SUBJECT',
    visibility: 'SCHOOL_ONLY',
    university: HCMUT,
    subjectCode: 'CO2017',
    memberCount: 640,
    description: 'Thảo luận bài tập lớn và lab Hệ điều hành của ĐH Bách khoa.',
  },
  {
    id: 'react-vn',
    name: 'React Developers Việt Nam',
    type: 'INTEREST',
    visibility: 'PUBLIC',
    university: null,
    subjectCode: null,
    memberCount: 4210,
    description: 'Chia sẻ kinh nghiệm React, Next.js và hệ sinh thái frontend cho sinh viên mọi trường.',
  },
  {
    id: 'dotnet-beginners',
    name: '.NET Beginners',
    type: 'INTEREST',
    visibility: 'PUBLIC',
    university: null,
    subjectCode: null,
    memberCount: 1380,
    description: 'Học C# và ASP.NET Core từ con số 0, có buổi code cùng nhau mỗi tuần.',
  },
  {
    id: 'ai-ml',
    name: 'AI / Machine Learning',
    type: 'INTEREST',
    visibility: 'PRIVATE',
    university: null,
    subjectCode: null,
    memberCount: 860,
    description: 'Nhóm đọc paper và làm project ML. Cần duyệt để đảm bảo thành viên tích cực.',
  },
  {
    id: 'nckh-cntt',
    name: 'Nhóm NCKH Khoa CNTT',
    type: 'INTEREST',
    visibility: 'PRIVATE',
    university: HCMUTE,
    subjectCode: null,
    memberCount: 74,
    description: 'Sinh viên làm nghiên cứu khoa học cùng giảng viên khoa CNTT. Thành viên do ban điều hành duyệt.',
  },
];

const KEY = 'study-hub-mock-community-membership';

/** Trạng thái mặc định của tài khoản demo, để màn hình có đủ các trường hợp. */
const DEMO_DEFAULT: Record<string, Membership> = {
  'csdl-db01': 'MEMBER',
  'web-nang-cao': 'MEMBER',
  dsa: 'MEMBER',
  'nckh-cntt': 'PENDING',
};

type Store = Record<string, Record<string, Membership>>;

function load(): Store {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Store;
  } catch {
    return {};
  }
}

export const mockMemberships = {
  of(userId: string): Record<string, Membership> {
    return load()[userId] ?? (userId === 'u-demo' ? { ...DEMO_DEFAULT } : {});
  },
  set(userId: string, communityId: string, membership: Membership) {
    const store = load();
    const mine = store[userId] ?? mockMemberships.of(userId);
    if (membership === 'NONE') delete mine[communityId];
    else mine[communityId] = membership;
    store[userId] = mine;
    sessionStorage.setItem(KEY, JSON.stringify(store));
  },
};
