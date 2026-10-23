import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, IconBriefcase, IconCode, IconExternalLink, IconGlobe, IconLink } from '../../../shared/ui';
import type { Profile } from '../model/profile-schemas';
import styles from './ProfileView.module.css';
import { SectionEmpty } from './SectionEmpty';

const LINK_TYPES: { key: keyof Profile['links']; label: string; icon: ReactNode }[] = [
  { key: 'github', label: 'GitHub', icon: <IconCode /> },
  { key: 'linkedin', label: 'LinkedIn', icon: <IconBriefcase /> },
  { key: 'portfolio', label: 'Portfolio', icon: <IconGlobe /> },
];

/** Chỉ gắn link http(s), chặn kiểu "javascript:..." nếu dữ liệu lỗi lọt qua BE. */
function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function toDisplayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function ProfileLinks({ links, isOwner }: { links: Profile['links']; isOwner: boolean }) {
  const items = LINK_TYPES.flatMap((type) => {
    const url = links[type.key];
    return url && isSafeUrl(url) ? [{ ...type, url }] : [];
  });

  return (
    <Card title="Liên kết" icon={<IconLink />} aside={`${items.length}/${LINK_TYPES.length}`}>
      {items.length === 0 ? (
        <SectionEmpty action={isOwner && <Link to="/profile/edit">Thêm liên kết</Link>}>
          {isOwner ? 'Thêm GitHub, LinkedIn hoặc portfolio để đồng đội xem sản phẩm của bạn.' : 'Chưa có liên kết nào.'}
        </SectionEmpty>
      ) : (
        <ul className={styles.linkList}>
          {items.map((item) => (
            <li key={item.key}>
              <a
                className={styles.linkItem}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.label}: ${toDisplayUrl(item.url)} (mở trong tab mới)`}
              >
                <span className={styles.linkIcon}>{item.icon}</span>
                <span className={styles.linkText}>
                  <span className={styles.linkLabel}>{item.label}</span>
                  <span className={styles.linkUrl}>{toDisplayUrl(item.url)}</span>
                </span>
                <IconExternalLink size={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
