import { Link } from 'react-router';
import { IconArrowLeft, IconLock } from '../../../shared/ui';
import type { Community } from '../model/community-schemas';
import { CommunityAvatar, communityMeta, VisibilityBadge } from './CommunityCard';
import styles from './Communities.module.css';
import { MembershipButton } from './MembershipButton';

interface Props {
  community: Community;
  onChange: (community: Community) => void;
}

/** Private hoặc School-only khác trường: chỉ thấy thông tin chung, không thấy nội dung (giống nhóm kín Facebook). */
export function CommunityGate({ community, onChange }: Props) {
  const reason =
    community.visibility === 'PRIVATE'
      ? community.membership === 'PENDING'
        ? 'Yêu cầu tham gia của bạn đang chờ quản trị viên duyệt. Khi được chấp nhận, bạn sẽ xem được tin nhắn và tài liệu.'
        : 'Đây là cộng đồng riêng tư. Chỉ thành viên mới xem được tin nhắn và tài liệu. Gửi yêu cầu để quản trị viên duyệt.'
      : `Cộng đồng này chỉ dành cho sinh viên ${community.university?.shortName}. Trường trong hồ sơ của bạn không khớp nên không thể tham gia.`;

  return (
    <div className={styles.gatePage}>
      <section className={styles.gate} aria-labelledby="gate-title">
        <CommunityAvatar community={community} size="lg" />
        <h1 id="gate-title" className={styles.gateTitle}>
          {community.name}
        </h1>
        <p className={styles.meta}>{communityMeta(community)}</p>
        <div className={styles.cardInfo}>
          <VisibilityBadge community={community} />
          <span className={styles.members}>{community.memberCount.toLocaleString('vi-VN')} thành viên</span>
        </div>
        <p className={styles.gateDescription}>{community.description}</p>
        <p className={styles.gateReason}>
          <IconLock size={16} />
          <span>{reason}</span>
        </p>
        <MembershipButton community={community} onChange={onChange} />
        <Link to="/communities" className={styles.textLink}>
          <IconArrowLeft size={16} /> Danh sách cộng đồng
        </Link>
      </section>
    </div>
  );
}

/** Thay ô soạn tin khi người chưa tham gia xem trước cộng đồng Public / cùng trường. */
export function JoinBar({ community, onChange }: Props) {
  return (
    <div className={styles.joinBar}>
      <p className={styles.joinText}>
        <strong>Bạn đang xem trước cộng đồng.</strong> Tham gia để nhắn tin, đặt câu hỏi và nhận thông báo.
      </p>
      <MembershipButton community={community} onChange={onChange} />
    </div>
  );
}
