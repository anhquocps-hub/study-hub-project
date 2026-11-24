import { useEffect, useRef, useState } from 'react';
import { IconEye, IconLock, IconMoreHorizontal, IconUnlock } from '../../../shared/ui';
import type { AdminUser } from '../model/admin-user-schemas';
import styles from './UserDirectory.module.css';

const SELF_HINT = 'Không thể thao tác trên tài khoản của chính bạn';

interface UserRowActionsProps {
  user: AdminUser;
  /** Hàng của chính admin đang đăng nhập: không khóa và không đổi quyền được. */
  isSelf: boolean;
  onView: () => void;
  onToggleStatus: () => void;
  onToggleRole: () => void;
}

/** Cột "Thao tác": xem chi tiết, khóa/mở khóa, menu đổi quyền. */
export function UserRowActions({ user, isSelf, onView, onToggleStatus, onToggleRole }: UserRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isBanned = user.status === 'BANNED';

  // Đóng menu khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !wrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  return (
    <div className={styles.rowActions} ref={wrapRef}>
      <button type="button" className={styles.iconButton} aria-label={`Xem chi tiết ${user.fullName}`} title="Xem chi tiết" onClick={onView}>
        <IconEye size={16} />
      </button>
      <button
        type="button"
        className={`${styles.iconButton} ${isBanned ? '' : styles.iconDanger}`}
        aria-label={`${isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'} ${user.fullName}`}
        title={isSelf ? SELF_HINT : isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        disabled={isSelf}
        onClick={onToggleStatus}
      >
        {isBanned ? <IconUnlock size={16} /> : <IconLock size={16} />}
      </button>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={`Thêm thao tác cho ${user.fullName}`}
        title={isSelf ? SELF_HINT : 'Thêm thao tác'}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        disabled={isSelf}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <IconMoreHorizontal size={16} />
      </button>
      {menuOpen && (
        <div className={styles.rowMenu} role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              onToggleRole();
            }}
          >
            {user.role === 'ADMIN' ? 'Bỏ quyền Quản trị viên' : 'Cấp quyền Quản trị viên'}
          </button>
        </div>
      )}
    </div>
  );
}
