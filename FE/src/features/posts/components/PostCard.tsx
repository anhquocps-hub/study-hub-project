import { useState } from 'react';
import { Link } from 'react-router';
import iconBookmark from '../../../assets/figma/post-bookmark.svg';
import iconClock from '../../../assets/figma/post-clock.svg';
import iconComment from '../../../assets/figma/post-comment.svg';
import iconCourse from '../../../assets/figma/post-course.svg';
import iconGoal from '../../../assets/figma/post-goal.svg';
import iconLevel from '../../../assets/figma/post-level.svg';
import iconLike from '../../../assets/figma/post-like.svg';
import iconRoles from '../../../assets/figma/post-roles.svg';
import iconShare from '../../../assets/figma/post-share.svg';
import iconStack from '../../../assets/figma/post-stack.svg';
import iconSubject from '../../../assets/figma/post-subject.svg';
import iconTimeline from '../../../assets/figma/post-timeline.svg';
import { getErrorMessage } from '../../../services/http-client';
import { Avatar, ConfirmDialog } from '../../../shared/ui';
import type { Post } from '../model/post-schemas';
import { formatFullDate, timeAgo } from '../utils/time-ago';
import type { CommentViewer } from './CommentItem';
import { CommentSection } from './CommentSection';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  /** Người đang xem; null = khách. Dùng để biết bài/bình luận nào là của mình. */
  currentUser: CommentViewer | null;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => Promise<void>;
  onToggleLike: (post: Post) => Promise<void>;
  onCommentCountChange: (post: Post, delta: number) => void;
  /** Trang chi tiết: mở sẵn phần bình luận. */
  defaultCommentsOpen?: boolean;
}

const SPEC_ITEMS = [
  { key: 'techStack', label: 'TECH STACK', icon: iconStack },
  { key: 'roles', label: 'VỊ TRÍ CẦN TUYỂN', icon: iconRoles },
  { key: 'level', label: 'YÊU CẦU TRÌNH ĐỘ', icon: iconLevel },
  { key: 'timeline', label: 'THỜI LƯỢNG & TIMELINE', icon: iconTimeline },
] as const;

export function PostCard({
  post,
  currentUser,
  onEdit,
  onDelete,
  onToggleLike,
  onCommentCountChange,
  defaultCommentsOpen = false,
}: PostCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(defaultCommentsOpen);
  const [confirmState, setConfirmState] = useState<{ busy: boolean; error: string | null } | null>(null);
  const isMine = currentUser?.id === post.author.id;
  const commentsId = `post-${post.id}-comments`;
  const { author, recruitment, studyGroup, seeking, course } = post;
  const isStudy = post.type === 'FIND_STUDY_GROUP';
  const courseLine = recruitment?.courseLabel ?? (course && `${course.subject} • ${course.classCode}`);
  const percent = recruitment ? Math.round((recruitment.slotsFilled / recruitment.slotsTotal) * 100) : 0;

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setConfirmState({ busy: true, error: null });
    try {
      await onDelete(post); // thành công: thẻ bài bị gỡ (feed) hoặc trang chuyển về feed (chi tiết)
    } catch (err) {
      setConfirmState({ busy: false, error: getErrorMessage(err) });
    }
  };

  return (
    <article className={styles.card} aria-labelledby={`post-${post.id}`}>
      <header className={styles.header}>
        <div className={styles.author}>
          <Link to={`/users/${author.id}`} className={styles.avatarLink}>
            <Avatar name={author.fullName} src={author.avatarUrl} className={isStudy ? `${styles.avatar} ${styles.avatarStudy}` : styles.avatar} />
          </Link>
          <div className={styles.authorInfo}>
            <p className={styles.authorRow}>
              <Link to={`/users/${author.id}`} className={styles.authorName}>
                {author.fullName}
              </Link>
              {author.headline && (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={isStudy ? `${styles.chip} ${styles.chipStudy}` : styles.chip}>{author.headline}</span>
                </>
              )}
              <span className={styles.dot}>•</span>
              <span className={styles.meta}>
                {author.cohort && `${author.cohort} • `}
                <Link to={`/posts/${post.id}`} className={styles.timeLink} title={formatFullDate(post.createdAt)}>
                  <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
                </Link>
                {post.updatedAt !== post.createdAt && ' (đã sửa)'}
              </span>
            </p>
            {courseLine && (
              <p className={isStudy ? `${styles.course} ${styles.courseStudy}` : styles.course}>
                <img src={isStudy ? iconSubject : iconCourse} alt="" />
                {isStudy ? `${course?.subject} • Học phần ${course?.classCode}` : courseLine}
              </p>
            )}
          </div>
        </div>
        {isMine && (
          <div className={styles.ownerActions}>
            <button type="button" className={styles.textBtn} onClick={() => onEdit(post)} disabled={busy}>
              Sửa
            </button>
            <button type="button" className={`${styles.textBtn} ${styles.danger}`} onClick={() => setConfirmState({ busy: false, error: null })} disabled={busy}>
              Xóa
            </button>
          </div>
        )}
      </header>

      <div className={styles.body}>
        {post.title && (
          <h2 id={`post-${post.id}`} className={styles.title}>
            {post.title}
          </h2>
        )}
        <p id={post.title ? undefined : `post-${post.id}`} className={styles.content}>
          {post.content}
        </p>
      </div>

      {recruitment && (
        <div className={styles.specBox}>
          <dl className={styles.specGrid}>
            {SPEC_ITEMS.map((item) => (
              <div key={item.key} className={styles.specItem}>
                <img src={item.icon} alt="" className={styles.specIcon} />
                <div>
                  <dt className={styles.label}>{item.label}</dt>
                  <dd className={styles.specValue}>{recruitment[item.key]}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className={styles.progress}>
            <p className={styles.progressHead}>
              <span>Tiến độ lập nhóm (Slots filled)</span>
              <span className={styles.progressValue}>
                {percent}% • {recruitment.slotsFilled} / {recruitment.slotsTotal} Thành viên
              </span>
            </p>
            <div
              className={styles.track}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Tiến độ lập nhóm"
            >
              <span className={styles.fill} style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      )}

      {studyGroup && course && (
        <div className={`${styles.specBox} ${styles.studyBox}`}>
          <dl className={styles.studyGrid}>
            <div>
              <dt className={styles.label}>MÔN HỌC &amp; MÃ LỚP</dt>
              <dd className={styles.studyValue}>
                {course.subject} • Lớp {course.classCode}
              </dd>
            </div>
            <div>
              <dt className={styles.label}>GIẢNG VIÊN PHỤ TRÁCH</dt>
              <dd className={styles.studyValue}>{course.lecturer ?? '—'}</dd>
            </div>
            <div>
              <dt className={styles.label}>LỊCH HỌC / REVIEW</dt>
              <dd className={`${styles.studyValue} ${styles.purpleText}`}>{studyGroup.schedule}</dd>
            </div>
          </dl>
          <p className={styles.goal}>
            <img src={iconGoal} alt="" />
            <span>
              <strong>Mục tiêu:</strong> {studyGroup.goal}
            </span>
          </p>
        </div>
      )}

      {seeking && (
        <ul className={styles.tags}>
          {seeking.skills.map((skill, index) => (
            <li key={skill} className={styles.skill}>
              <span className={index < 2 ? styles.skillDot : `${styles.skillDot} ${styles.skillDotPurple}`} />
              {skill}
            </li>
          ))}
          <li className={`${styles.skill} ${styles.available}`}>
            <img src={iconClock} alt="" />
            {seeking.availability}
          </li>
        </ul>
      )}

      {post.tags.length > 0 && (
        <ul className={styles.tags}>
          {post.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              #{tag}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <footer className={styles.actions}>
        <button
          type="button"
          className={post.likedByMe ? `${styles.action} ${styles.liked}` : styles.action}
          aria-pressed={post.likedByMe}
          aria-label={`Thích (${post.likeCount})`}
          onClick={() => run(() => onToggleLike(post))}
          disabled={busy}
        >
          <img src={iconLike} alt="" />
          {post.likeCount}
        </button>
        <button
          type="button"
          className={isCommentsOpen ? `${styles.action} ${styles.liked}` : styles.action}
          aria-label={`Bình luận (${post.commentCount})`}
          aria-expanded={isCommentsOpen}
          aria-controls={isCommentsOpen ? commentsId : undefined}
          onClick={() => setIsCommentsOpen((open) => !open)}
        >
          <img src={iconComment} alt="" />
          {post.commentCount}
        </button>
        <button type="button" className={styles.action} disabled title="Sắp có">
          <img src={iconShare} alt="" />
          Chia sẻ
        </button>
        <button type="button" className={styles.action} aria-label="Lưu bài viết" disabled title="Sắp có">
          <img src={iconBookmark} alt="" />
        </button>
      </footer>

      {isCommentsOpen && (
        <div id={commentsId}>
          <CommentSection
            postId={post.id}
            currentUser={currentUser}
            onCountChange={(delta) => onCommentCountChange(post, delta)}
          />
        </div>
      )}

      {confirmState && (
        <ConfirmDialog
          title="Xóa bài viết?"
          message="Bài viết và toàn bộ bình luận sẽ bị xóa vĩnh viễn. Thao tác không thể hoàn tác."
          confirmLabel="Xóa bài viết"
          isBusy={confirmState.busy}
          error={confirmState.error}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </article>
  );
}
