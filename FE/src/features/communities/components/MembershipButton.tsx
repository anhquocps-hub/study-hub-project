import { useState } from 'react';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import { IconCheck, IconLock } from '../../../shared/ui';
import { useMembershipAction, type MembershipAction } from '../hooks/useCommunities';
import type { Community } from '../model/community-schemas';
import styles from './Communities.module.css';

interface MembershipButtonProps {
  community: Community;
  onChange: (community: Community) => void;
  /** Có thì hiện nút "Rời cộng đồng" khi đã là thành viên (dùng ở trang chi tiết). */
  allowLeave?: boolean;
  /** Kéo dài nút hết chiều ngang khung chứa. */
  wide?: boolean;
}

/**
 * Nút tham gia theo trạng thái (PRD mục 11):
 * Public / School-only cùng trường → "Tham gia" (vào ngay) · Private → "Gửi yêu cầu" → "Đang chờ duyệt"
 * · School-only khác trường → nút khóa kèm lý do · Đã tham gia → "Đã tham gia" (+ "Rời" nếu allowLeave).
 */
export function MembershipButton({ community, onChange, allowLeave = false, wide = false }: MembershipButtonProps) {
  const runAction = useMembershipAction();
  const [busy, setBusy] = useState<MembershipAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: MembershipAction) => {
    if (action === 'leave' && !window.confirm(`Rời "${community.name}"? Bạn sẽ không nhắn tin được trong cộng đồng này nữa.`))
      return;
    setBusy(action);
    setError(null);
    try {
      onChange(await runAction(community.id, action));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : GENERIC_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const wrapClass = wide ? `${styles.membership} ${styles.membershipWide}` : styles.membership;
  let content;

  if (community.membership === 'MEMBER') {
    content = (
      <>
        <span className={styles.joined}>
          <IconCheck size={16} /> Đã tham gia
        </span>
        {allowLeave && (
          <button type="button" className={styles.btnGhostDanger} onClick={() => run('leave')} disabled={busy !== null}>
            {busy === 'leave' ? 'Đang rời…' : 'Rời cộng đồng'}
          </button>
        )}
      </>
    );
  } else if (community.membership === 'PENDING') {
    content = (
      <>
        <span className={styles.pending} role="status">
          Đang chờ duyệt
        </span>
        <button type="button" className={styles.btnGhost} onClick={() => run('cancel')} disabled={busy !== null}>
          {busy === 'cancel' ? 'Đang hủy…' : 'Hủy yêu cầu'}
        </button>
      </>
    );
  } else if (!community.canJoin) {
    content = (
      <button type="button" className={styles.btnLocked} disabled>
        <IconLock size={16} /> Chỉ dành cho SV {community.university?.shortName}
      </button>
    );
  } else {
    const isPrivate = community.visibility === 'PRIVATE';
    content = (
      <button type="button" className={styles.btnPrimary} onClick={() => run('join')} disabled={busy !== null}>
        {busy === 'join' ? (isPrivate ? 'Đang gửi…' : 'Đang tham gia…') : isPrivate ? 'Gửi yêu cầu tham gia' : 'Tham gia'}
      </button>
    );
  }

  return (
    <div className={wrapClass}>
      <div className={styles.membershipRow}>{content}</div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
