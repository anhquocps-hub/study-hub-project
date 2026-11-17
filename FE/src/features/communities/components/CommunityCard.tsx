import { Link } from 'react-router';
import { IconArrowRight } from '../../../shared/ui';
import { TYPE_LABELS, VISIBILITY_LABELS, type Community } from '../model/community-schemas';
import styles from './Communities.module.css';
import { MembershipButton } from './MembershipButton';

/** "Cơ sở dữ liệu (CSDL DB01)" → "CD"; dùng làm ảnh đại diện chữ cho cộng đồng. */
function initials(name: string) {
  // Bỏ ký tự không phải chữ ở đầu mỗi từ: ".NET Beginners" → NB, "AI / Machine Learning" → AM
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}]+/u, ''))
    .filter(Boolean);
  return ((words[0]?.[0] ?? '?') + (words[1]?.[0] ?? '')).toUpperCase();
}

const TYPE_CLASS = { UNIVERSITY: styles.typeUniversity, SUBJECT: styles.typeSubject, INTEREST: styles.typeInterest };

export function CommunityAvatar({ community, size = 'md' }: { community: Community; size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.avatar} ${TYPE_CLASS[community.type]} ${size === 'lg' ? styles.avatarLg : ''}`} aria-hidden="true">
      {initials(community.name)}
    </span>
  );
}

/** "Môn học • IT204 • HCMUTE" */
export function communityMeta(community: Community) {
  return [TYPE_LABELS[community.type], community.subjectCode, community.university?.shortName].filter(Boolean).join(' • ');
}

export function VisibilityBadge({ community }: { community: Community }) {
  return (
    <span className={`${styles.badge} ${styles[`visibility${community.visibility}`]}`}>
      {VISIBILITY_LABELS[community.visibility]}
      {community.visibility === 'SCHOOL_ONLY' && community.university && ` ${community.university.shortName}`}
    </span>
  );
}

interface CommunityCardProps {
  community: Community;
  onChange: (community: Community) => void;
}

export function CommunityCard({ community, onChange }: CommunityCardProps) {
  const href = `/communities/${community.id}`;
  return (
    <article className={styles.card} aria-labelledby={`community-${community.id}`}>
      <header className={styles.cardHead}>
        <CommunityAvatar community={community} />
        <div className={styles.cardTitleWrap}>
          <h2 id={`community-${community.id}`} className={styles.cardTitle}>
            <Link to={href}>{community.name}</Link>
          </h2>
          <p className={styles.meta}>{communityMeta(community)}</p>
        </div>
      </header>
      <p className={styles.description}>{community.description}</p>
      <div className={styles.cardInfo}>
        <VisibilityBadge community={community} />
        <span className={styles.members}>{community.memberCount.toLocaleString('vi-VN')} thành viên</span>
      </div>
      <footer className={styles.cardFoot}>
        {community.membership === 'MEMBER' ? (
          <Link to={href} className={styles.btnSecondary}>
            Vào cộng đồng <IconArrowRight size={16} />
          </Link>
        ) : (
          <>
            <MembershipButton community={community} onChange={onChange} wide />
            <Link to={href} className={styles.textLink}>
              Xem
            </Link>
          </>
        )}
      </footer>
    </article>
  );
}
