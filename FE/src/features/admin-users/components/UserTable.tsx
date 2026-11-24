import type { ReactNode } from 'react';
import { Avatar } from '../../../shared/ui';
import type { AdminUser } from '../model/admin-user-schemas';
import { EMPTY_CELL, formatDateTime } from '../model/format';
import { UserStatusBadge } from './UserStatusBadge';
import styles from './UserDirectory.module.css';

function trustTone(score: number) {
  if (score >= 80) return styles.trustHigh;
  if (score >= 50) return styles.trustMid;
  return styles.trustLow;
}

interface UserRowProps {
  user: AdminUser;
  selected: boolean;
  onSelect: () => void;
  actions: ReactNode;
}

function UserRow({ user, selected, onSelect, actions }: UserRowProps) {
  const created = formatDateTime(user.createdAt);
  const isBanned = user.status === 'BANNED';
  const subline = [user.studentId ? `MSSV: ${user.studentId}` : user.title, user.cohort].filter(Boolean).join(' • ');

  return (
    <tr className={selected ? styles.rowSelected : undefined}>
      <td className={styles.checkCell}>
        <input type="checkbox" aria-label={`Chọn ${user.fullName}`} checked={selected} onChange={onSelect} />
      </td>
      <td>
        <div className={styles.identity}>
          <span className={styles.avatarWrap}>
            <Avatar name={user.fullName} src={user.avatarUrl} className={styles.avatar} />
            <span className={`${styles.presence} ${isBanned ? styles.presenceOff : ''}`} aria-hidden="true" />
          </span>
          <span className={styles.identityText}>
            <span className={styles.nameRow}>
              <span className={`${styles.name} ${isBanned ? styles.nameBanned : ''}`}>{user.fullName}</span>
              {user.username && <span className={styles.usernameTag}>{user.username}</span>}
            </span>
            <span className={styles.subline}>{subline || EMPTY_CELL}</span>
            <span className={styles.email}>{user.email}</span>
          </span>
        </div>
      </td>
      <td>
        <span className={styles.school}>{user.university?.name ?? EMPTY_CELL}</span>
        <span className={styles.faculty}>{user.faculty ?? EMPTY_CELL}</span>
        {(user.highlight || user.className) && (
          <span className={styles.muted}>{user.highlight ?? `Lớp: ${user.className}`}</span>
        )}
      </td>
      <td>
        <div className={styles.chips}>
          {user.role === 'ADMIN' && <span className={`${styles.chip} ${styles.chipRole}`}>Quản trị viên</span>}
          {user.skills?.map((skill) => (
            <span key={skill} className={styles.chip}>
              {skill}
            </span>
          ))}
          {!user.skills && user.role !== 'ADMIN' && <span className={styles.muted}>{EMPTY_CELL}</span>}
        </div>
      </td>
      <td>
        <span className={styles.date}>{created.date}</span>
        <span className={styles.muted}>{created.time}</span>
      </td>
      <td>
        {user.trustScore === null ? (
          <span className={styles.muted}>{EMPTY_CELL}</span>
        ) : (
          <div className={styles.trust}>
            <span className={styles.trustRow}>
              <span className={`${styles.trustScore} ${trustTone(user.trustScore)}`}>{user.trustScore}/100</span>
              {user.violationSummary && <span className={styles.muted}>{user.violationSummary}</span>}
            </span>
            <span className={styles.trustBar} aria-hidden="true">
              <span className={trustTone(user.trustScore)} style={{ width: `${user.trustScore}%` }} />
            </span>
          </div>
        )}
      </td>
      <td>
        <UserStatusBadge user={user} />
      </td>
      <td>{actions}</td>
    </tr>
  );
}

interface UserTableProps {
  users: AdminUser[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  renderActions: (user: AdminUser) => ReactNode;
}

/** Bảng người dùng (Figma "Main User Table"). Trường mở rộng null hiện "—". */
export function UserTable({ users, selectedIds, onToggle, onToggleAll, renderActions }: UserTableProps) {
  const allSelected = users.length > 0 && users.every((user) => selectedIds.has(user.id));
  return (
    <table className={styles.table} aria-label="Danh sách người dùng">
      <thead>
        <tr>
          <th className={styles.checkCell}>
            <input type="checkbox" aria-label="Chọn tất cả trên trang" checked={allSelected} onChange={onToggleAll} />
          </th>
          <th>SINH VIÊN / TÀI KHOẢN</th>
          <th>TRƯỜNG &amp; KHOA NGÀNH</th>
          <th>KỸ NĂNG / VAI TRÒ</th>
          <th>NGÀY TẠO</th>
          <th>ĐỘ TIN CẬY (TRUST)</th>
          <th>TRẠNG THÁI</th>
          <th>THAO TÁC</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            selected={selectedIds.has(user.id)}
            onSelect={() => onToggle(user.id)}
            actions={renderActions(user)}
          />
        ))}
      </tbody>
    </table>
  );
}
