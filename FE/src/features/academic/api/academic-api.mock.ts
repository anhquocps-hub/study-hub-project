// Dữ liệu trường mẫu, dùng khi VITE_USE_MOCK_API=true.
import type { University } from '../model/academic-schemas';

const universities: University[] = [
  { id: 'hcmute', name: 'ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)' },
  { id: 'uit', name: 'ĐH Công nghệ Thông tin – ĐHQG-HCM (UIT)' },
  { id: 'hcmut', name: 'ĐH Bách khoa – ĐHQG-HCM (HCMUT)' },
  { id: 'hcmus', name: 'ĐH Khoa học Tự nhiên – ĐHQG-HCM (HCMUS)' },
  { id: 'ueh', name: 'ĐH Kinh tế TP.HCM (UEH)' },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUniversities(signal?: AbortSignal): Promise<University[]> {
  await delay();
  signal?.throwIfAborted();
  return universities;
}
