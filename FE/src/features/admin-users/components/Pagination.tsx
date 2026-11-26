import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '../../../shared/ui';
import { PAGE_SIZES, type PageSize, type UserListResult } from '../model/admin-user-schemas';
import { formatCount } from '../model/format';
import styles from './UserDirectory.module.css';

/** Các trang hiển thị: trang đầu, trang cuối, trang hiện tại ±1; chỗ bị bỏ qua là "…". */
export function pageItems(current: number, total: number): (number | 'gap')[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('gap');
    items.push(page);
  });
  return items;
}

interface PaginationProps {
  pagination: UserListResult['pagination'];
  onPage: (page: number) => void;
  onLimit: (limit: PageSize) => void;
}

export function Pagination({ pagination, onPage, onLimit }: PaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className={styles.pagination}>
      <div className={styles.pageInfo}>
        <span>
          Hiển thị {from} - {to} trong tổng số {formatCount(total)} người dùng
        </span>
        <span aria-hidden="true">|</span>
        <label className={styles.pageSize}>
          Hàng trên trang:
          <select
            aria-label="Hàng trên trang"
            value={limit}
            onChange={(event) => onLimit(Number(event.target.value) as PageSize)}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <nav className={styles.pages} aria-label="Phân trang">
        <button type="button" className={styles.pageNav} aria-label="Trang đầu" disabled={isFirst} onClick={() => onPage(1)}>
          <IconChevronsLeft size={16} />
        </button>
        <button
          type="button"
          className={styles.pageNav}
          aria-label="Trang trước"
          disabled={isFirst}
          onClick={() => onPage(page - 1)}
        >
          <IconChevronLeft size={16} />
        </button>
        {pageItems(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className={styles.pageGap} aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`${styles.pageButton} ${item === page ? styles.pageCurrent : ''}`}
              aria-label={`Trang ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPage(item)}
            >
              {item}
            </button>
          ),
        )}
        <button type="button" className={styles.pageNav} aria-label="Trang sau" disabled={isLast} onClick={() => onPage(page + 1)}>
          <IconChevronRight size={16} />
        </button>
        <button
          type="button"
          className={styles.pageNav}
          aria-label="Trang cuối"
          disabled={isLast}
          onClick={() => onPage(totalPages)}
        >
          <IconChevronsRight size={16} />
        </button>
      </nav>
    </div>
  );
}
