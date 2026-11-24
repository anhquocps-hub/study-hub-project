import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Avatar, IconX, INERT_PROPS, Skeleton } from '../../../shared/ui';
import { useAuth } from '../../auth';
import { useAdminUserDetail } from '../hooks/useAdminUserDetail';
import type { AdminUserDetail } from '../model/admin-user-schemas';
import { EMPTY_CELL } from '../model/format';
import { UserStatusBadge } from './UserStatusBadge';
import styles from './UserDrawer.module.css';

const NO_DATA = 'Chưa có dữ liệu';

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {aside && <span className={styles.sectionAside}>{aside}</span>}
      </header>
      {children}
    </section>
  );
}

function Empty() {
  return <p className={styles.empty}>{NO_DATA}</p>;
}

const TAG_TONE: Record<string, string> = { 'Đang tuyển': styles.tagGreen, Guild: styles.tagAccent };

function DetailBody({ user }: { user: AdminUserDetail }) {
  const subline = [user.studentId ? `MSSV: ${user.studentId}` : user.title, user.cohort].filter(Boolean).join(' • ');
  return (
    <>
      <section className={styles.summary}>
        <div className={styles.summaryTop}>
          <Avatar name={user.fullName} src={user.avatarUrl} className={styles.avatar} />
          <div className={styles.summaryText}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{user.fullName}</h2>
              <UserStatusBadge user={user} />
            </div>
            <p className={styles.subline}>{subline || EMPTY_CELL}</p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
        {user.stats ? (
          <dl className={styles.stats}>
            <div>
              <dt>Space Tham gia</dt>
              <dd>{user.stats.spaces} Nhóm</dd>
            </div>
            <div>
              <dt>Bài đã đăng</dt>
              <dd className={styles.accent}>{user.stats.posts} Post</dd>
            </div>
            <div>
              <dt>Báo cáo vi phạm</dt>
              <dd className={user.stats.reports > 0 ? styles.danger : styles.success}>{user.stats.reports} Báo cáo</dd>
            </div>
          </dl>
        ) : (
          <Empty />
        )}
      </section>

      <Section title="THÔNG TIN TRƯỜNG & THẺ SINH VIÊN" aside={user.verification ? 'ĐÃ ĐỐI SOÁT SSO' : undefined}>
        <dl className={styles.grid}>
          {(user.verification ?? [{ label: 'Trường đào tạo', value: user.university?.name ?? EMPTY_CELL }]).map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="KHÔNG GIAN (SPACES) ĐANG HOẠT ĐỘNG"
        aside={user.stats ? `${user.stats.spaces} NHÓM` : undefined}
      >
        {user.spaces ? (
          <ul className={styles.list}>
            {user.spaces.map((space) => (
              <li key={space.id} className={styles.space}>
                <span className={styles.spaceIcon} aria-hidden="true">
                  #
                </span>
                <span className={styles.spaceText}>
                  <span className={styles.spaceName}>{space.name}</span>
                  <span className={styles.meta}>
                    Vai trò: {space.role} • {space.members} thành viên
                  </span>
                </span>
                <span className={`${styles.tag} ${TAG_TONE[space.tag] ?? ''}`}>{space.tag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="BÀI ĐĂNG & HOẠT ĐỘNG GẦN NHẤT" aside={user.recentPosts ? 'LOG 7 NGÀY QUA' : undefined}>
        {user.recentPosts ? (
          <ul className={styles.list}>
            {user.recentPosts.map((post) => (
              <li key={post.id} className={styles.post}>
                <p className={styles.postHead}>
                  <span className={styles.postTitle}>{post.title}</span>
                  <span className={styles.meta}>{post.at}</span>
                </p>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                <p className={styles.postFoot}>
                  <span>❤️ {post.likes} quan tâm</span>
                  <span>💬 {post.comments} bình luận</span>
                  <span className={styles.success}>Trạng thái: {post.status}</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </Section>

      <Section title="TÁC VỤ CAN THIỆP QUẢN TRỊ VIÊN">
        {/* BE chưa có API cho 4 tác vụ này: hiển thị đúng thiết kế, bấm không có gì xảy ra. */}
        <div className={styles.actions}>
          <button type="button" className={styles.action} {...INERT_PROPS}>
            Reset Mật khẩu
          </button>
          <button type="button" className={styles.action} {...INERT_PROPS}>
            Gửi Inbox Admin
          </button>
          <button type="button" className={`${styles.action} ${styles.actionWarn}`} {...INERT_PROPS}>
            Tặng 1 Gậy Cảnh Cáo
          </button>
          <button type="button" className={`${styles.action} ${styles.actionDanger}`} {...INERT_PROPS}>
            Tạm Khóa 7 Ngày
          </button>
        </div>
      </Section>
    </>
  );
}

interface UserDrawerProps {
  userId: string;
  onClose: () => void;
}

/**
 * Ngăn chi tiết trượt từ phải (Figma "Detailed User Drawer", rộng 576px).
 * Đóng bằng nút X, "Đóng ngăn", phím Esc hoặc bấm nền mờ. Mở thì focus vào ngăn, đóng thì trả focus về nút đã mở.
 */
export function UserDrawer({ userId, onClose }: UserDrawerProps) {
  const { user: me } = useAuth();
  const { state, retry } = useAdminUserDetail(userId);
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  return (
    <div className={styles.layer}>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <aside ref={panelRef} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className={styles.header}>
          <p className={styles.headerTitle}>
            <span id={titleId}>Hồ sơ Quản trị Chi tiết</span>
            <span className={styles.live}>Live Audit</span>
          </p>
          <button type="button" className={styles.close} aria-label="Đóng" onClick={onClose}>
            <IconX size={16} />
          </button>
        </header>

        <div className={styles.body}>
          {state.status === 'loading' && (
            <div className={styles.loading} role="status" aria-label="Đang tải hồ sơ">
              <Skeleton height="168px" />
              <Skeleton height="137px" />
              <Skeleton height="200px" />
            </div>
          )}
          {state.status === 'error' && (
            <div className={styles.error} role="alert">
              <p>{state.message}</p>
              {state.httpStatus !== 404 && (
                <button type="button" className={styles.action} onClick={retry}>
                  Thử lại
                </button>
              )}
            </div>
          )}
          {state.status === 'success' && <DetailBody user={state.data} />}
        </div>

        <footer className={styles.footer}>
          <span>Admin Session: {me?.email ?? EMPTY_CELL}</span>
          <button type="button" className={styles.footerClose} onClick={onClose}>
            Đóng ngăn
          </button>
        </footer>
      </aside>
    </div>
  );
}
