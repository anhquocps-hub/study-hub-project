import iconSend from '../../../assets/figma/chat-send.svg';
import { FOCUS_FALLBACK_ATTR, Skeleton } from '../../../shared/ui';
import { useCommentThread } from '../hooks/useCommentThread';
import type { Comment } from '../model/comment-schemas';
import { CommentComposer } from './CommentComposer';
import { CommentItem, type CommentViewer } from './CommentItem';
import styles from './Comments.module.css';

interface CommentSectionProps {
  postId: string;
  /** null = chưa đăng nhập: chỉ xem, không có ô bình luận. */
  currentUser: CommentViewer | null;
  /** Số bình luận của bài thay đổi (+1 khi thêm, -n khi xóa kèm phản hồi). */
  onCountChange: (delta: number) => void;
}

/** Phần bình luận dưới bài viết: ô viết bình luận, danh sách bình luận gốc (phân trang) và phản hồi. */
export function CommentSection({ postId, currentUser, onCountChange }: CommentSectionProps) {
  const thread = useCommentThread(postId, null, true);

  const handleCreate = async (content: string) => {
    await thread.create(content);
    onCountChange(1);
  };

  const handleDelete = async (comment: Comment) => {
    const removed = await thread.remove(comment.id);
    onCountChange(-removed);
  };

  const handleRepliesChange = (commentId: string, delta: number) => {
    thread.adjustReplyCount(commentId, delta);
    onCountChange(delta);
  };

  return (
    <section className={styles.section} aria-label="Bình luận">
      {currentUser && thread.status === 'success' && (
        <CommentComposer
          label="Viết bình luận"
          placeholder="Viết bình luận…"
          submitLabel="Gửi bình luận"
          submitIcon={iconSend}
          viewer={currentUser}
          onSubmit={handleCreate}
        />
      )}

      {thread.status === 'loading' && (
        <div className={styles.list} role="status" aria-label="Đang tải bình luận">
          {[0, 1].map((key) => (
            <div key={key} className={styles.skeletonRow}>
              <Skeleton width="32px" height="32px" />
              <Skeleton width="60%" height="40px" />
            </div>
          ))}
        </div>
      )}

      {thread.status === 'error' && (
        <p className={styles.error} role="alert">
          Không tải được bình luận. {thread.error}{' '}
          <button type="button" className={styles.linkBtn} onClick={thread.retry}>
            Thử lại
          </button>
        </p>
      )}

      {thread.status === 'success' && (
        <div className={styles.list} tabIndex={-1} aria-label="Danh sách bình luận" {...{ [FOCUS_FALLBACK_ATTR]: '' }}>
          {thread.comments.length === 0 && (
            <p className={styles.muted}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          )}
          {thread.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={thread.update}
              onDelete={handleDelete}
              onRepliesChange={(delta) => handleRepliesChange(comment.id, delta)}
            />
          ))}
          {thread.hasMore && (
            <button
              type="button"
              className={styles.repliesToggle}
              onClick={() => void thread.loadMore()}
              disabled={thread.isLoadingMore}
            >
              {thread.isLoadingMore ? 'Đang tải…' : 'Xem thêm bình luận'}
            </button>
          )}
          {thread.loadMoreError && (
            <p className={styles.error} role="alert">
              {thread.loadMoreError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
