import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import iconSend from '../../../assets/figma/chat-send.svg';
import { getErrorMessage } from '../../../services/http-client';
import { Avatar, ConfirmDialog, FOCUS_FALLBACK_ATTR } from '../../../shared/ui';
import { useCommentThread } from '../hooks/useCommentThread';
import type { Comment } from '../model/comment-schemas';
import { formatFullDate, timeAgo } from '../utils/time-ago';
import { CommentComposer } from './CommentComposer';
import styles from './Comments.module.css';

export interface CommentViewer {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

interface CommentItemProps {
  comment: Comment;
  currentUser: CommentViewer | null;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (comment: Comment) => Promise<void>;
  /** Chỉ bình luận gốc: phản hồi được thêm/xóa (để cập nhật replyCount và commentCount của bài). */
  onRepliesChange?: (delta: number) => void;
}

type FocusTarget = 'edit' | 'reply' | null;

/** Một bình luận. Bình luận gốc có thêm nút "Trả lời" và luồng phản hồi (tải khi mở). */
export function CommentItem({ comment, currentUser, onUpdate, onDelete, onRepliesChange }: CommentItemProps) {
  const isRoot = comment.parentId === null;
  const isMine = currentUser?.id === comment.author.id;
  const author = comment.author.fullName;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{ busy: boolean; error: string | null } | null>(null);
  // Đóng ô sửa/trả lời thì trả focus về nút đã mở nó (nút bị ẩn khi đang sửa).
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);
  const editBtnRef = useRef<HTMLButtonElement>(null);
  const replyBtnRef = useRef<HTMLButtonElement>(null);
  const replies = useCommentThread(comment.postId, comment.id, isRoot && isRepliesOpen);
  const repliesId = `comment-${comment.id}-replies`;

  useEffect(() => {
    if (!focusTarget) return;
    (focusTarget === 'edit' ? editBtnRef : replyBtnRef).current?.focus();
    setFocusTarget(null);
  }, [focusTarget]);

  const closeEditor = () => {
    setIsEditing(false);
    setFocusTarget('edit');
  };

  const closeReply = () => {
    setIsReplying(false);
    setFocusTarget('reply');
  };

  const handleDelete = async () => {
    setConfirmState({ busy: true, error: null });
    try {
      await onDelete(comment); // thành công: bình luận bị gỡ, focus chuyển về vùng danh sách
    } catch (error) {
      setConfirmState({ busy: false, error: getErrorMessage(error) });
    }
  };

  const handleReply = async (content: string) => {
    await replies.create(content);
    onRepliesChange?.(1);
    closeReply();
  };

  const handleDeleteReply = async (reply: Comment) => {
    await replies.remove(reply.id);
    onRepliesChange?.(-1);
  };

  const startReply = () => {
    setIsReplying(true);
    setIsRepliesOpen(true);
  };

  const hiddenReplies = comment.replyCount - replies.comments.length;

  return (
    <article className={isRoot ? styles.comment : `${styles.comment} ${styles.reply}`} aria-label={`Bình luận của ${author}`}>
      <Link to={`/users/${comment.author.id}`} className={styles.avatarLink} tabIndex={-1} aria-hidden="true">
        <Avatar name={author} src={comment.author.avatarUrl} className={isRoot ? styles.avatar : styles.avatarSm} />
      </Link>
      <div className={styles.commentMain}>
        {isEditing ? (
          <CommentComposer
            label="Sửa bình luận"
            submitLabel="Lưu"
            initialValue={comment.content}
            autoFocus
            onSubmit={async (content) => {
              await onUpdate(comment.id, content);
              closeEditor();
            }}
            onCancel={closeEditor}
          />
        ) : (
          <div className={styles.bubble}>
            <Link to={`/users/${comment.author.id}`} className={styles.commentAuthor}>
              {author}
            </Link>
            <p className={styles.commentContent}>{comment.content}</p>
          </div>
        )}

        {!isEditing && (
          <div className={styles.commentMeta}>
            <time dateTime={comment.createdAt} title={formatFullDate(comment.createdAt)}>
              {timeAgo(comment.createdAt)}
            </time>
            {comment.updatedAt !== comment.createdAt && <span>(đã sửa)</span>}
            {isRoot && currentUser && (
              <button ref={replyBtnRef} type="button" className={styles.metaBtn} onClick={startReply}>
                Trả lời
              </button>
            )}
            {isMine && (
              <>
                <button
                  ref={editBtnRef}
                  type="button"
                  className={styles.metaBtn}
                  aria-label={`Sửa bình luận của ${author}`}
                  onClick={() => setIsEditing(true)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className={`${styles.metaBtn} ${styles.danger}`}
                  aria-label={`Xóa bình luận của ${author}`}
                  onClick={() => setConfirmState({ busy: false, error: null })}
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        )}

        {isRoot && (comment.replyCount > 0 || isRepliesOpen) && (
          <button
            type="button"
            className={styles.repliesToggle}
            aria-expanded={isRepliesOpen}
            aria-controls={isRepliesOpen ? repliesId : undefined}
            onClick={() => {
              setIsRepliesOpen((open) => !open);
              setIsReplying(false);
            }}
          >
            {isRepliesOpen ? 'Ẩn phản hồi' : `Xem ${comment.replyCount} phản hồi`}
          </button>
        )}

        {isRoot && isRepliesOpen && (
          <div id={repliesId} className={styles.replies} tabIndex={-1} {...{ [FOCUS_FALLBACK_ATTR]: '' }}>
            {replies.status === 'loading' && (
              <p className={styles.muted} role="status">
                Đang tải phản hồi…
              </p>
            )}
            {replies.status === 'error' && (
              <p className={styles.error} role="alert">
                {replies.error}{' '}
                <button type="button" className={styles.linkBtn} onClick={replies.retry}>
                  Thử lại
                </button>
              </p>
            )}
            {replies.comments.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onUpdate={replies.update}
                onDelete={handleDeleteReply}
              />
            ))}
            {replies.status === 'success' && replies.hasMore && hiddenReplies > 0 && (
              <button
                type="button"
                className={styles.repliesToggle}
                onClick={() => void replies.loadMore()}
                disabled={replies.isLoadingMore}
              >
                {replies.isLoadingMore ? 'Đang tải…' : `Xem thêm ${hiddenReplies} phản hồi`}
              </button>
            )}
            {replies.loadMoreError && (
              <p className={styles.error} role="alert">
                {replies.loadMoreError}
              </p>
            )}
            {isReplying && currentUser && replies.status === 'success' && (
              <CommentComposer
                label={`Trả lời ${author}`}
                placeholder={`Trả lời ${author}…`}
                submitLabel="Gửi phản hồi"
                submitIcon={iconSend}
                viewer={currentUser}
                autoFocus
                onSubmit={handleReply}
                onCancel={closeReply}
              />
            )}
          </div>
        )}
      </div>

      {confirmState && (
        <ConfirmDialog
          title="Xóa bình luận?"
          message={
            isRoot && comment.replyCount > 0
              ? `Bình luận và ${comment.replyCount} phản hồi của nó sẽ bị xóa vĩnh viễn.`
              : 'Bình luận sẽ bị xóa vĩnh viễn.'
          }
          confirmLabel="Xóa bình luận"
          isBusy={confirmState.busy}
          error={confirmState.error}
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </article>
  );
}
