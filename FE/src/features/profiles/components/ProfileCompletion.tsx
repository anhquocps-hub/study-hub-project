import { useWatch } from 'react-hook-form';
import type { ProfileFormValues } from '../model/profile-form';
import styles from './ProfileForm.module.css';

const CHECKS: { label: string; isDone: (values: ProfileFormValues) => boolean }[] = [
  { label: 'trường và ngành', isDone: (v) => v.universityId !== '' && v.majorId !== '' },
  { label: 'khóa', isDone: (v) => v.cohort.trim() !== '' },
  { label: 'giới thiệu', isDone: (v) => v.bio.trim() !== '' },
  { label: 'kỹ năng', isDone: (v) => v.skills.length > 0 },
  { label: 'sở thích', isDone: (v) => v.interests.length > 0 },
  { label: 'liên kết', isDone: (v) => [v.githubUrl, v.linkedinUrl, v.portfolioUrl].some((url) => url.trim() !== '') },
];

const RING_RADIUS = 16;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Độ hoàn thiện hồ sơ, tính ngay trên dữ liệu đang nhập. */
export function ProfileCompletion() {
  const values = useWatch<ProfileFormValues>() as ProfileFormValues;
  const missing = CHECKS.filter((check) => !check.isDone(values)).map((check) => check.label);
  const percent = Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100);
  const hint =
    missing.length === 0
      ? 'Hồ sơ đã đầy đủ.'
      : `Thêm ${missing.slice(0, 2).join(' và ')} để hồ sơ đầy đủ hơn.`;

  return (
    <div className={styles.completion} role="status">
      <svg className={styles.ring} width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <circle className={styles.ringTrack} cx="20" cy="20" r={RING_RADIUS} />
        <circle
          className={styles.ringValue}
          cx="20"
          cy="20"
          r={RING_RADIUS}
          strokeDasharray={`${(RING_LENGTH * percent) / 100} ${RING_LENGTH}`}
        />
      </svg>
      <div>
        <p className={styles.completionTitle}>
          Độ hoàn thiện hồ sơ: <strong>{percent}%</strong>
        </p>
        <p className={styles.completionHint}>{hint}</p>
      </div>
    </div>
  );
}
