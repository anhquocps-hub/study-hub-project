import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  PAGE_SIZES,
  USER_ROLES,
  USER_STATUSES,
  type PageSize,
  type UserListQuery,
} from '../model/admin-user-schemas';

const DEFAULT_LIMIT: PageSize = 10;

function readQuery(params: URLSearchParams): UserListQuery {
  const page = Number(params.get('page'));
  const limit = Number(params.get('limit'));
  const role = params.get('role');
  const status = params.get('status');
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: (PAGE_SIZES as readonly number[]).includes(limit) ? (limit as PageSize) : DEFAULT_LIMIT,
    search: params.get('search') ?? '',
    role: USER_ROLES.find((value) => value === role) ?? '',
    status: USER_STATUSES.find((value) => value === status) ?? '',
  };
}

/**
 * Bộ lọc + phân trang của bảng người dùng, lưu trên URL (?search=&role=&status=&page=&limit=)
 * để F5 hoặc chia sẻ link không mất. Giá trị mặc định không ghi lên URL.
 * Đổi bất kỳ thứ gì ngoài `page` thì tự về trang 1. Các tham số khác trên URL (ví dụ ?user=) được giữ nguyên.
 */
export function useUserListQuery() {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => readQuery(params), [params]);

  const setQuery = useCallback(
    (patch: Partial<UserListQuery>) => {
      setParams((current) => {
        const next = { ...readQuery(current), ...patch };
        if (!('page' in patch)) next.page = 1;
        const result = new URLSearchParams(current);
        const write = (key: string, value: string, isDefault: boolean) => {
          if (isDefault) result.delete(key);
          else result.set(key, value);
        };
        write('search', next.search.trim(), next.search.trim() === '');
        write('role', next.role, next.role === '');
        write('status', next.status, next.status === '');
        write('page', String(next.page), next.page === 1);
        write('limit', String(next.limit), next.limit === DEFAULT_LIMIT);
        return result;
      });
    },
    [setParams],
  );

  return { query, setQuery };
}
