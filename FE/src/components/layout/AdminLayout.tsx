import { Link, NavLink, Outlet } from 'react-router';
import iconFeed from '../../assets/figma/nav-feed.svg';
import { IconArrowLeft, INERT_PROPS } from '../../shared/ui';
import { AppHeader } from './AppLayout';
import shell from './AppLayout.module.css';
import styles from './AdminLayout.module.css';

/** Các mục quản trị theo Figma (33:819). Chỉ mục 3 đã làm; các mục còn lại hiển thị nhưng chưa hoạt động. */
const ADMIN_SECTIONS: { label: string; to?: string; badge?: { text: string; tone: 'green' | 'red' } }[] = [
  { label: '1. Tổng quan & Thống kê' },
  { label: '2. Quản lý nhóm & Cộng đồng', badge: { text: '4 mới', tone: 'green' } },
  { label: '3. Quản lý người dùng', to: '/admin/users' },
  { label: '4. Quản lý bài & Kiểm duyệt' },
  { label: '5. Xử lý báo cáo vi phạm', badge: { text: '9', tone: 'red' } },
];

function AdminSidebar() {
  return (
    <aside className={shell.aside} aria-label="Điều hướng quản trị">
      <nav className={shell.nav}>
        <p className={shell.section}>ĐIỀU HƯỚNG CHUNG</p>
        <NavLink to="/" end className={shell.link}>
          <img src={iconFeed} alt="" />
          Bảng tin &amp; Khám phá
        </NavLink>
        <Link to="/" className={shell.link}>
          <IconArrowLeft size={16} />
          Về giao diện sinh viên
        </Link>

        <p className={`${shell.section} ${styles.adminSection}`}>
          <span>QUẢN TRỊ HỆ THỐNG</span>
          <span className={styles.coreTag}>ADMIN CORE</span>
        </p>
        {ADMIN_SECTIONS.map((section) => {
          const badge = section.badge && (
            <span className={`${styles.badge} ${styles[section.badge.tone]}`}>{section.badge.text}</span>
          );
          return section.to ? (
            <NavLink
              key={section.label}
              to={section.to}
              className={({ isActive }) => `${shell.link} ${styles.item} ${isActive ? styles.itemActive : ''}`}
            >
              <span>{section.label}</span>
              {badge}
            </NavLink>
          ) : (
            <span key={section.label} className={`${shell.link} ${shell.soon} ${styles.item}`} {...INERT_PROPS}>
              <span>{section.label}</span>
              {badge}
            </span>
          );
        })}
      </nav>
    </aside>
  );
}

/** Khung trang Admin: Header chung + thanh điều hướng quản trị + nội dung. */
export function AdminLayout() {
  return (
    <div className={shell.shell}>
      <AppHeader />
      <AdminSidebar />
      <main className={shell.main}>
        <Outlet />
      </main>
    </div>
  );
}
