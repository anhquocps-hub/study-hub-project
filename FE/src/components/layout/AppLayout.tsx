import { useState, type FormEvent } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import iconBell from '../../assets/figma/header-bell.svg';
import iconMessage from '../../assets/figma/header-message.svg';
import iconSearch from '../../assets/figma/header-search.svg';
import iconChevron from '../../assets/figma/nav-chevron.svg';
import iconCollapse from '../../assets/figma/nav-collapse.svg';
import iconCommunity from '../../assets/figma/nav-community.svg';
import iconCreatePost from '../../assets/figma/nav-create-post.svg';
import iconExplore from '../../assets/figma/nav-explore.svg';
import iconFeed from '../../assets/figma/nav-feed.svg';
import iconHelp from '../../assets/figma/nav-help.svg';
import iconPlusCircle from '../../assets/figma/nav-plus-circle.svg';
import iconPlus from '../../assets/figma/nav-plus.svg';
import iconProject from '../../assets/figma/nav-project.svg';
import iconSettings from '../../assets/figma/nav-settings.svg';
import iconStudy from '../../assets/figma/nav-study.svg';
import { useAuth } from '../../features/auth';
import { useMyRooms, type RoomSummary } from '../../features/chat';
import { useProfile } from '../../features/profiles';
import { Avatar } from '../../shared/ui';
import styles from './AppLayout.module.css';

function RoomLink({ room }: { room: RoomSummary }) {
  const isSpace = room.kind === 'SPACE';
  return (
    <NavLink
      to={`/${isSpace ? 'spaces' : 'communities'}/${room.id}`}
      className={({ isActive }) => [isSpace ? styles.spaceLink : styles.subLink, isActive && styles.subActive].filter(Boolean).join(' ')}
    >
      <span className={styles.subLabel}>
        {isSpace && <img src={room.badge.tone === 'green' ? iconProject : iconStudy} alt="" />}
        <span className={styles.ellipsis}>{room.name}</span>
      </span>
      <span className={`${styles.tag} ${styles[room.badge.tone]}`}>{room.badge.text}</span>
    </NavLink>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { state } = useMyRooms();
  const [communitiesOpen, setCommunitiesOpen] = useState(true);
  const rooms = state.status === 'success' ? state.data : [];
  const communities = rooms.filter((room) => room.kind === 'COMMUNITY');
  const spaces = rooms.filter((room) => room.kind === 'SPACE');

  return (
    <aside className={styles.aside} aria-label="Điều hướng chính">
      <nav className={styles.nav}>
        <p className={styles.section}>
          ĐIỀU HƯỚNG
          <img src={iconCollapse} alt="" />
        </p>
        <NavLink to="/" end className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}>
          <img src={iconFeed} alt="" />
          Bảng tin
        </NavLink>
        <span className={`${styles.link} ${styles.soon}`} title="Sắp có">
          <img src={iconExplore} alt="" />
          Khám phá &amp; Tìm kiếm
        </span>

        <button
          type="button"
          className={`${styles.link} ${styles.groupToggle}`}
          aria-expanded={communitiesOpen}
          onClick={() => setCommunitiesOpen((open) => !open)}
        >
          <span className={styles.subLabel}>
            <img src={iconCommunity} alt="" />
            Cộng đồng
          </span>
          <span className={styles.count}>
            {communities.length}
            <img src={iconChevron} alt="" className={communitiesOpen ? styles.chevronOpen : undefined} />
          </span>
        </button>
        {communitiesOpen && (
          <div className={styles.subList}>
            {communities.map((room) => (
              <RoomLink key={room.id} room={room} />
            ))}
            <span className={styles.createCommunity} title="Sắp có">
              <img src={iconPlusCircle} alt="" />
              Tạo cộng đồng
            </span>
          </div>
        )}

        <p className={`${styles.section} ${styles.sectionSpaced}`}>
          KHÔNG GIAN NHÓM
          <img src={iconPlus} alt="" />
        </p>
        {spaces.map((room) => (
          <RoomLink key={room.id} room={room} />
        ))}
      </nav>

      <div className={styles.asideFooter}>
        <button type="button" className={styles.createBtn} onClick={() => navigate('/', { state: { compose: true } })}>
          <img src={iconCreatePost} alt="" />
          Tạo bài viết
        </button>
        <div className={styles.footerLinks}>
          <span title="Sắp có">
            <img src={iconSettings} alt="" />
            Cài đặt
          </span>
          <span title="Sắp có">
            <img src={iconHelp} alt="" />
            Trợ giúp
          </span>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const { user, logout } = useAuth();
  const { state } = useProfile('me');
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = state.status === 'success' ? state.data : null;
  const name = profile?.fullName ?? user?.fullName ?? '';
  const subline = [profile?.cohort, profile?.major?.name].filter(Boolean).join(' - ');

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.toString().trim() ?? '';
    navigate(query ? `/?subject=${encodeURIComponent(query)}` : '/');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        UniSpace
      </Link>
      <form className={styles.search} role="search" onSubmit={search}>
        <img src={iconSearch} alt="" className={styles.searchIcon} />
        <input name="q" type="search" placeholder="Tìm kiếm môn học, project, đồng đội, giảng viên..." aria-label="Tìm kiếm" />
      </form>
      <div className={styles.headerRight}>
        <button type="button" className={styles.headerIcon} aria-label="Tin nhắn">
          <img src={iconMessage} alt="" />
        </button>
        <button type="button" className={styles.headerIcon} aria-label="Thông báo (có thông báo mới)">
          <img src={iconBell} alt="" />
          <span className={styles.bellDot} />
        </button>
        <span className={styles.divider} aria-hidden="true" />
        <div className={styles.userWrap}>
          <button
            type="button"
            className={styles.user}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.userText}>
              <span className={styles.userName}>{name}</span>
              {subline && <span className={styles.userSub}>{subline}</span>}
            </span>
            <Avatar name={name || '?'} src={profile?.avatarUrl} className={styles.userAvatar} />
          </button>
          {menuOpen && (
            <div className={styles.menu} role="menu" onClick={() => setMenuOpen(false)}>
              <Link role="menuitem" to="/profile/me">
                Hồ sơ của tôi
              </Link>
              <button role="menuitem" type="button" onClick={() => void logout()}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/** Khung chung sau đăng nhập: Header + thanh điều hướng trái + nội dung trang. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
