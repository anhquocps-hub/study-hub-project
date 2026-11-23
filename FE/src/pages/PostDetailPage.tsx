import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PostCard, PostFormModal, usePost, useViewer } from '../features/posts';
import { ErrorState, Skeleton } from '../shared/ui';
import styles from './PostDetailPage.module.css';

/** Chi tiết bài viết: thẻ bài + toàn bộ bình luận (mở sẵn). */
export function PostDetailPage() {
  const { postId = '' } = useParams();
  const navigate = useNavigate();
  const { viewer, composerAuthor } = useViewer();
  const { state, retry, post, update, remove, toggleLike, adjustCommentCount } = usePost(postId);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    await remove();
    void navigate('/', { replace: true });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>Chi tiết bài viết</h1>
      <nav className={styles.breadcrumb} aria-label="Điều hướng">
        <Link to="/">← Bảng tin</Link>
      </nav>

      {state.status === 'loading' && (
        <div className={styles.skeletonCard} role="status" aria-label="Đang tải bài viết">
          <Skeleton width="40%" />
          <Skeleton height="64px" />
          <Skeleton width="70%" />
        </div>
      )}

      {state.status === 'error' &&
        (state.httpStatus === 404 ? (
          <ErrorState
            title="Không tìm thấy bài viết"
            message="Bài viết không tồn tại hoặc đã bị tác giả xóa."
            action={<Link to="/">Về bảng tin</Link>}
          />
        ) : (
          <ErrorState title="Không tải được bài viết" message={state.message} onRetry={retry} />
        ))}

      {post && (
        <PostCard
            key={post.id} // đổi bài: tạo lại thẻ để không giữ state (bình luận, hộp thoại) của bài cũ
            post={post}
            currentUser={viewer}
            defaultCommentsOpen
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
            onToggleLike={toggleLike}
            onCommentCountChange={(_, delta) => adjustCommentCount(delta)}
          />
      )}

      {post && isEditing && (
        <PostFormModal post={post} author={composerAuthor} onSubmit={update} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
}
