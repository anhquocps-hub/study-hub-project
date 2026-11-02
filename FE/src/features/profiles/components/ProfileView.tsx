import type { Profile } from '../model/profile-schemas';
import { ProfileHero } from './ProfileHero';
import { ProfileInterests } from './ProfileInterests';
import { ProfileLinks } from './ProfileLinks';
import { ProfileProjects } from './ProfileProjects';
import { ProfileSkills } from './ProfileSkills';
import styles from './ProfileView.module.css';

interface ProfileViewProps {
  profile: Profile;
  /** true khi đang xem hồ sơ của chính mình: hiện nút sửa và lời nhắc ở các mục rỗng. */
  isOwner: boolean;
}

/** Trang hồ sơ: phần đầu, lưới 1/3 (liên kết, sở thích) + 2/3 (kỹ năng, project). */
export function ProfileView({ profile, isOwner }: ProfileViewProps) {
  return (
    <div className={styles.view}>
      <ProfileHero profile={profile} isOwner={isOwner} />
      <div className={styles.columns}>
        <div className={styles.column}>
          <ProfileLinks links={profile.links} isOwner={isOwner} />
          <ProfileInterests interests={profile.interests} isOwner={isOwner} />
        </div>
        <div className={styles.column}>
          <ProfileSkills skills={profile.skills} isOwner={isOwner} />
          <ProfileProjects projects={profile.projects} isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
}
