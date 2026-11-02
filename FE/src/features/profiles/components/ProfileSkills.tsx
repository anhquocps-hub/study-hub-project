import { Link } from 'react-router';
import { Badge, Card, IconZap } from '../../../shared/ui';
import { SKILL_LEVEL_LABELS, type Profile, type SkillLevel } from '../model/profile-schemas';
import styles from './ProfileView.module.css';
import { SectionEmpty } from './SectionEmpty';

const LEVEL_BADGE: Record<SkillLevel, 'neutral' | 'info' | 'accent'> = {
  BEGINNER: 'neutral',
  INTERMEDIATE: 'info',
  ADVANCED: 'accent',
};

export function ProfileSkills({ skills, isOwner }: { skills: Profile['skills']; isOwner: boolean }) {
  return (
    <Card title="Kỹ năng & mức độ thành thạo" icon={<IconZap />} aside={`${skills.length} kỹ năng`}>
      {skills.length === 0 ? (
        <SectionEmpty action={isOwner && <Link to="/profile/edit">Thêm kỹ năng</Link>}>
          {isOwner ? 'Bạn chưa thêm kỹ năng nào. Kỹ năng giúp người khác tìm bạn khi lập nhóm.' : 'Chưa có kỹ năng nào.'}
        </SectionEmpty>
      ) : (
        <ul className={styles.skillGrid}>
          {skills.map((skill) => (
            <li key={skill.name} className={styles.skill} data-level={skill.level}>
              <div className={styles.skillHeader}>
                <span className={styles.skillName}>{skill.name}</span>
                <Badge variant={LEVEL_BADGE[skill.level]}>{SKILL_LEVEL_LABELS[skill.level]}</Badge>
              </div>
              <span className={styles.skillBar} aria-hidden="true" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
