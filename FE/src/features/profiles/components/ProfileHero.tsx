import { Link } from 'react-router';
import { Avatar, ButtonLink, IconPencil, IconSchool } from '../../../shared/ui';
import type { Profile } from '../model/profile-schemas';
import styles from './ProfileView.module.css';

interface ProfileHeroProps {
  profile: Profile;
  isOwner: boolean;
}

/** Phần đầu trang hồ sơ : dải bìa, ảnh đại diện, tên, thông tin học tập, giới thiệu. */
export function ProfileHero({ profile, isOwner }: ProfileHeroProps) {
  const academic = [profile.major?.name, profile.university?.name].filter(Boolean).join(' · ');
  const missing = [!profile.university && 'trường', !profile.major && 'ngành học'].filter(Boolean).join(' và ');

  return (
    <section className={styles.hero} aria-labelledby="profile-name">
      <div className={styles.cover} aria-hidden="true" />

      <div className={styles.identity}>
        <div className={styles.avatarWrap}>
          <Avatar name={profile.fullName} src={profile.avatarUrl} size="lg" />
        </div>

        <div className={styles.identityText}>
          <h1 id="profile-name" className={styles.name}>
            {profile.fullName}
          </h1>
          {(profile.cohort || (isOwner && profile.studentId)) && (
            <p className={styles.meta}>
              {profile.cohort && <span>Khóa {profile.cohort}</span>}
              {isOwner && profile.studentId && <span>MSSV: {profile.studentId}</span>}
            </p>
          )}
          {academic && (
            <p className={styles.academic}>
              <IconSchool size={16} />
              <span>{academic}</span>
            </p>
          )}
        </div>

        {isOwner && (
          <div className={styles.actions}>
            <ButtonLink to="/profile/edit" variant="secondary" leadingIcon={<IconPencil size={16} />}>
              Chỉnh sửa hồ sơ
            </ButtonLink>
          </div>
        )}
      </div>

      {isOwner && missing && (
        <p className={styles.notice}>
          Hồ sơ chưa có {missing}, nên người khác khó tìm thấy bạn khi lọc theo trường và ngành.{' '}
          <Link to="/profile/edit">Hoàn thiện hồ sơ</Link>
        </p>
      )}

      <div className={styles.bio}>
        <span className={styles.bioLabel}>Giới thiệu: </span>
        {profile.bio ? (
          profile.bio
        ) : isOwner ? (
          <>
            Bạn chưa viết giới thiệu. <Link to="/profile/edit">Thêm giới thiệu</Link>
          </>
        ) : (
          <span className={styles.muted}>Chưa có giới thiệu.</span>
        )}
      </div>
    </section>
  );
}
