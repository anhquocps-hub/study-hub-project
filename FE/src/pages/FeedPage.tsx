import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import iconCreate from '../assets/figma/feed-create-post.svg';
import iconFilter from '../assets/figma/feed-filter.svg';
import iconSearchBtn from '../assets/figma/feed-search-btn.svg';
import iconSearch from '../assets/figma/feed-search.svg';
import { useAuth } from '../features/auth';
import { PostCard, PostFormModal, usePosts, type Post } from '../features/posts';
import { useProfile } from '../features/profiles';
import { Avatar, ErrorState, Skeleton } from '../shared/ui';
import styles from './FeedPage.module.css';

/** Học kỳ hiện tại theo năm học VN: tháng 8 trở đi là HK1 của năm học mới. */
function currentTerm(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 8) return `HỌC KỲ 1 • ${year}-${year + 1}`;
  return `HỌC KỲ ${month >= 6 ? 'HÈ' : 2} • ${year - 1}-${year}`;
}

/** Bảng tin: danh sách bài viết + tạo/sửa/xóa bài. */
export function FeedPage() {
  const { user } = useAuth();
  const { state: profileState } = useProfile('me');
  const [searchParams, setSearchParams] = useSearchParams();
  const subject = searchParams.get('subject') ?? '';
  const { state, retry, posts, create, update, remove, toggleLike } = usePosts(subject);
  const location = useLocation();
  const navigate = useNavigate();
  // null = đóng; 'new' = tạo bài; Post = sửa bài đó
  const [editing, setEditing] = useState<Post | 'new' | null>(null);

  const profile = profileState.status === 'success' ? profileState.data : null;
  const fullName = profile?.fullName ?? user?.fullName ?? '';
  const universityShort = profile?.university?.name.match(/\(([^)]+)\)/)?.[1] ?? profile?.university?.name ?? null;

  // Nút "Tạo bài viết" ở thanh bên trái chuyển về đây kèm state compose
  useEffect(() => {
    if ((location.state as { compose?: boolean } | null)?.compose) {
      setEditing('new');
      void navigate(location.pathname + location.search, { replace: true, state: null });
    }
  }, [location, navigate]);

  const searchSubject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('subject')?.toString().trim() ?? '';
    setSearchParams(value ? { subject: value } : {});
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <h1 className={styles.srOnly}>Bảng tin</h1>

      <section className={styles.launcher} aria-label="Tạo bài viết nhanh">
        <span className={styles.launcherGlow} aria-hidden="true" />
        <span className={styles.avatarWrap}>
          <Avatar name={fullName || '?'} src={profile?.avatarUrl} className={styles.avatar} />
          <span className={styles.online} aria-hidden="true" />
        </span>
        <div className={styles.launcherText}>
          <p className={styles.launcherTitle}>{fullName} ơi, bạn đang tìm teammate hay cần lập nhóm học?</p>
          <p className={styles.launcherSub}>
            {currentTerm()}
            {universityShort && ` • KHÔNG GIAN SINH VIÊN ${universityShort}`}
          </p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setEditing('new')}>
          <img src={iconCreate} alt="" />
          Tạo bài viết
        </button>
      </section>

      <form className={styles.subjectSearch} role="search" onSubmit={searchSubject} key={subject}>
        <label className={styles.subjectInput}>
          <img src={iconSearch} alt="" className={styles.subjectIcon} />
          <input
            name="subject"
            type="search"
            defaultValue={subject}
            placeholder="Nhập tên môn học, mã học phần (vd: CSDL, Lập trình Web, SE302)..."
            aria-label="Tìm theo môn học hoặc mã học phần"
          />
        </label>
        <button type="submit" className={`${styles.primaryBtn} ${styles.searchBtn}`} aria-label="Tìm môn học">
          <img src={iconSearchBtn} alt="" />
          Tìm môn học
        </button>
      </form>

      <div className={styles.filterBar}>
        {subject ? (
          <p className={styles.filterInfo}>
            Kết quả cho “{subject}”
            <button type="button" onClick={() => setSearchParams({})}>
              Xóa lọc
            </button>
          </p>
        ) : (
          <span />
        )}
        <span className={styles.filterBtn} title="Sắp có">
          <img src={iconFilter} alt="" />
          BỘ LỌC NÂNG CAO
        </span>
      </div>

      {state.status === 'loading' && (
        <div className={styles.list} role="status" aria-label="Đang tải bài viết">
          {[0, 1].map((key) => (
            <div key={key} className={styles.skeletonCard}>
              <Skeleton width="40%" />
              <Skeleton height="48px" />
              <Skeleton width="70%" />
            </div>
          ))}
        </div>
      )}
      {state.status === 'error' && (
        <ErrorState title="Không tải được bảng tin" message={state.message} onRetry={retry} />
      )}
      {state.status === 'success' && (
        <div className={styles.list}>
          {posts.length === 0 && (
            <p className={styles.empty}>
              {subject ? 'Chưa có bài viết nào cho môn học này.' : 'Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!'}
            </p>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isMine={post.author.id === user?.id}
              onEdit={setEditing}
              onDelete={(item) => remove(item.id)}
              onToggleLike={(item) => toggleLike(item.id)}
            />
          ))}
        </div>
      )}

      {editing && (
        <PostFormModal
          post={editing === 'new' ? null : editing}
          author={{
            fullName,
            avatarUrl: profile?.avatarUrl ?? null,
            university: universityShort,
            universityName: profile?.university?.name ?? null,
          }}
          onSubmit={(input) => (editing === 'new' ? create(input) : update(editing.id, input))}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
