import { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconSearch, INERT_PROPS } from '../../../shared/ui';
import type { UserListQuery, UserRole, UserStatus } from '../model/admin-user-schemas';
import styles from './UserDirectory.module.css';

/** Chờ người dùng ngừng gõ 300ms rồi mới lọc, tránh gọi API mỗi phím. */
const SEARCH_DEBOUNCE_MS = 300;

interface UserFiltersProps {
  query: UserListQuery;
  onChange: (patch: Partial<UserListQuery>) => void;
}

export function UserFilters({ query, onChange }: UserFiltersProps) {
  const [search, setSearch] = useState(query.search);
  // Giá trị gần nhất ô này đã gửi lên URL. URL đổi vì chính ô này thì không ghi đè lại ô nhập,
  // để không mất dấu cách cuối hay chữ vừa gõ thêm trong lúc URL đang cập nhật.
  const lastSentRef = useRef(query.search);

  // Bộ lọc trên URL đổi từ nơi khác (ví dụ nút Back) thì cập nhật ô nhập.
  useEffect(() => {
    if (query.search === lastSentRef.current.trim()) return;
    lastSentRef.current = query.search;
    setSearch(query.search);
  }, [query.search]);

  useEffect(() => {
    if (search.trim() === query.search.trim()) return;
    const timer = setTimeout(() => {
      lastSentRef.current = search;
      onChange({ search });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, query.search, onChange]);

  return (
    <div className={styles.toolbar} role="search">
      <label className={styles.searchBox}>
        <IconSearch size={16} />
        <input
          type="search"
          aria-label="Tìm kiếm người dùng"
          placeholder="Tìm theo Tên, MSSV, Email trường (@hcmute.edu.vn, @hust.edu.vn...), Khoa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <div className={styles.filterCluster}>
        {/* BE chưa lọc được theo trường: hiển thị nhưng không hoạt động. */}
        <button type="button" className={`${styles.select} ${styles.schoolFilter}`} aria-label="Lọc theo trường" {...INERT_PROPS}>
          <span>Tất cả trường</span>
          <IconChevronDown size={16} />
        </button>

        <label className={styles.selectWrap}>
          <select
            className={styles.select}
            aria-label="Lọc theo vai trò"
            value={query.role}
            onChange={(event) => onChange({ role: event.target.value as UserRole | '' })}
          >
            <option value="">Vai trò: Tất cả</option>
            <option value="USER">Vai trò: Sinh viên</option>
            <option value="ADMIN">Vai trò: Quản trị viên</option>
          </select>
          <IconChevronDown size={16} />
        </label>

        <label className={styles.selectWrap}>
          <select
            className={styles.select}
            aria-label="Lọc theo trạng thái"
            value={query.status}
            onChange={(event) => onChange({ status: event.target.value as UserStatus | '' })}
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Trạng thái: Đang hoạt động</option>
            <option value="BANNED">Trạng thái: Đã khóa</option>
          </select>
          <IconChevronDown size={16} />
        </label>
      </div>
    </div>
  );
}
