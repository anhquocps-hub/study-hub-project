import { Link } from 'react-router';
import { Avatar, IconArrowRight } from '../../../shared/ui';
import { ROLE_LABELS, STATUS_LABELS, type Group, type Person } from '../model/search-schemas';
import styles from './ResultCards.module.css';

export function PersonCard({ person }: { person: Person }) {
  const meta = [person.cohort, person.major, person.university].filter(Boolean).join(' • ');
  return (
    <article className={styles.card} aria-labelledby={`person-${person.id}`}>
      <div className={styles.row}>
        <Link to={`/users/${person.id}`} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
          <Avatar name={person.fullName} src={person.avatarUrl} className={styles.avatar} />
        </Link>
        <div className={styles.main}>
          <h2 id={`person-${person.id}`} className={styles.name}>
            <Link to={`/users/${person.id}`}>{person.fullName}</Link>
            {person.role && <span className={styles.role}>{ROLE_LABELS[person.role]}</span>}
          </h2>
          {meta && <p className={styles.meta}>{meta}</p>}
          {person.headline && <p className={styles.text}>{person.headline}</p>}
          {person.skills.length > 0 && (
            <ul className={styles.tags} aria-label="Kỹ năng">
              {person.skills.map((skill) => (
                <li key={skill} className={styles.tag}>
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link to={`/users/${person.id}`} className={styles.action}>
          Xem hồ sơ
        </Link>
      </div>
    </article>
  );
}

const STATUS_CLASS = { RECRUITING: styles.recruiting, FULL: styles.full, CLOSED: styles.closed };

export function GroupCard({ group }: { group: Group }) {
  const meta = [group.kind === 'PROJECT' ? 'Nhóm dự án' : 'Nhóm học', group.subject, group.university].filter(Boolean).join(' • ');
  const percent = Math.min(100, Math.round((group.memberCount / group.maxMembers) * 100));
  return (
    <article className={styles.card} aria-labelledby={`group-${group.id}`}>
      <div className={styles.row}>
        <span className={`${styles.groupIcon} ${group.kind === 'PROJECT' ? styles.project : styles.study}`} aria-hidden="true">
          {group.kind === 'PROJECT' ? 'DA' : 'HN'}
        </span>
        <div className={styles.main}>
          <h2 id={`group-${group.id}`} className={styles.name}>
            {group.name}
            <span className={`${styles.status} ${STATUS_CLASS[group.status]}`}>{STATUS_LABELS[group.status]}</span>
          </h2>
          <p className={styles.meta}>{meta}</p>
          {group.lookingFor.length > 0 && (
            <p className={styles.text}>
              <strong>Đang tìm:</strong> {group.lookingFor.join(', ')}
            </p>
          )}
          <div className={styles.slots}>
            <span className={styles.slotText}>
              {group.memberCount} / {group.maxMembers} thành viên
            </span>
            <span
              className={styles.track}
              role="progressbar"
              aria-label="Số thành viên"
              aria-valuenow={group.memberCount}
              aria-valuemin={0}
              aria-valuemax={group.maxMembers}
            >
              <span className={styles.fill} style={{ width: `${percent}%` }} />
            </span>
          </div>
        </div>
        {group.isMember ? (
          <Link to={`/spaces/${group.id}`} className={styles.action}>
            Vào nhóm <IconArrowRight size={16} />
          </Link>
        ) : (
          <span className={styles.note}>
            {group.status === 'RECRUITING' ? 'Gửi yêu cầu từ bài tuyển' : 'Không nhận thêm thành viên'}
          </span>
        )}
      </div>
    </article>
  );
}
