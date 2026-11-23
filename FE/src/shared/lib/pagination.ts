import { z } from 'zod';

/**
 * Một trang dữ liệu theo kiểu cursor: BE trả về `nextCursor` để lấy trang kế tiếp, `null` khi đã hết.
 * Cursor là chuỗi mờ (opaque): FE chỉ chuyển lại nguyên vẹn cho BE, không tự phân tích.
 */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export function pageSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item), nextCursor: z.string().nullable() });
}

export interface PageQuery {
  cursor?: string | null;
  limit?: number;
}

/** Ghép query phân trang vào URLSearchParams (bỏ qua giá trị rỗng). */
export function appendPageQuery(params: URLSearchParams, { cursor, limit }: PageQuery) {
  if (cursor) params.set('cursor', cursor);
  if (limit) params.set('limit', String(limit));
}

/** Gộp trang mới vào danh sách đang có, bỏ phần tử trùng id (ví dụ bài vừa tạo cũng có trong trang sau). */
export function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !ids.has(item.id))];
}
