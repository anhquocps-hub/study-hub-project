import { useParams } from 'react-router';
import { ChatWorkspace, useChatRoom, type ChatRoom } from '../features/chat';
import { ErrorState, Skeleton } from '../shared/ui';
import styles from './ChatRoomPage.module.css';

/** Trang chat: /spaces/:roomId (chat nhóm) và /communities/:roomId (chat cộng đồng). */
export function ChatRoomPage({ kind }: { kind: ChatRoom['kind'] }) {
  const { roomId = '' } = useParams();
  const { state, retry } = useChatRoom(kind, roomId);

  if (state.status === 'loading')
    return (
      <div className={styles.loading} role="status" aria-label="Đang tải phòng chat">
        <Skeleton height="56px" />
        <Skeleton height="200px" />
      </div>
    );
  if (state.status === 'error')
    return (
      <div className={styles.loading}>
        <ErrorState
          title={state.httpStatus === 404 ? 'Không tìm thấy' : 'Không tải được phòng chat'}
          message={state.message}
          onRetry={state.httpStatus === 404 ? undefined : retry}
        />
      </div>
    );
  return <ChatWorkspace key={state.data.id} room={state.data} />;
}
