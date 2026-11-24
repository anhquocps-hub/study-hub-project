import { Button, IconBell, IconDownload, IconUserPlus, INERT_PROPS } from '../../../shared/ui';
import { formatCount } from '../model/format';
import styles from './UserDirectory.module.css';

/** Tiêu đề trang + 3 nút chung (BE chưa hỗ trợ nên bấm không có gì xảy ra). */
export function DirectoryHeader({ total }: { total: number | null }) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.titleBlock}>
        <p className={styles.metaRow}>
          <span className={styles.sectionTag}>PRD SEC. 31 • USER IAM CORE</span>
          <span aria-hidden="true">•</span>
          <span>Sync: vừa xong</span>
        </p>
        <h1 className={styles.pageTitle}>
          Quản lý Người dùng &amp; Sinh viên <span className={styles.pageTitleSub}>(User Directory)</span>
        </h1>
        <p className={styles.pageDescription}>
          Quản trị danh tính, vai trò, lịch sử vi phạm và trạng thái hoạt động của{' '}
          <strong className={styles.totalCount}>{total === null ? '…' : formatCount(total)}</strong> sinh viên trên toàn
          hệ thống mạng lưới UniSpace.
        </p>
      </div>
      <div className={styles.globalActions}>
        <button type="button" className={styles.ghostButton} {...INERT_PROPS}>
          <IconBell size={16} />
          Thông báo hệ thống
        </button>
        <button type="button" className={styles.ghostButton} {...INERT_PROPS}>
          <IconDownload size={16} />
          Xuất CSV
        </button>
        <Button className={styles.primarySmall} {...INERT_PROPS}>
          <IconUserPlus size={16} />
          Thêm người dùng
        </Button>
      </div>
    </header>
  );
}
