import { Link } from 'react-router';
import { Badge, Card, IconHeart } from '../../../shared/ui';
import styles from './ProfileView.module.css';
import { SectionEmpty } from './SectionEmpty';

export function ProfileInterests({ interests, isOwner }: { interests: string[]; isOwner: boolean }) {
  return (
    <Card title="Sở thích" icon={<IconHeart />}>
      {interests.length === 0 ? (
        <SectionEmpty action={isOwner && <Link to="/profile/edit">Thêm sở thích</Link>}>
          {isOwner ? 'Bạn chưa thêm sở thích nào.' : 'Chưa có sở thích nào.'}
        </SectionEmpty>
      ) : (
        <ul className={styles.chips}>
          {interests.map((interest) => (
            <li key={interest}>
              <Badge>{interest}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
