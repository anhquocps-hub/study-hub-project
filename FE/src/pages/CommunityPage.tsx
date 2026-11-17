import { useState } from 'react';
import { useParams } from 'react-router';
import { ChatWorkspace, useChatRoom } from '../features/chat';
import {
  canPreview,
  CommunityGate,
  JoinBar,
  MembershipButton,
  useCommunity,
  type Community,
} from '../features/communities';
import { ErrorState, Skeleton } from '../shared/ui';
import styles from './ChatRoomPage.module.css';

function Loading() {
  return (
    <div className={styles.loading} role="status" aria-label="Đang tải cộng đồng">
      <Skeleton height="56px" />
      <Skeleton height="200px" />
    </div>
  );
}

/** Phòng chat của cộng đồng; người chưa tham gia xem trước được (Public / cùng trường) nhưng chưa nhắn được. */
function CommunityChat({ community, onChange }: { community: Community; onChange: (community: Community) => void }) {
  const { state, retry } = useChatRoom('COMMUNITY', community.id);
  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error')
    return (
      <div className={styles.loading}>
        <ErrorState title="Không tải được phòng chat" message={state.message} onRetry={retry} />
      </div>
    );
  const isMember = community.membership === 'MEMBER';
  return (
    <ChatWorkspace
      key={state.data.id}
      room={state.data}
      composer={isMember ? undefined : <JoinBar community={community} onChange={onChange} />}
      settingsMenu={isMember && <MembershipButton community={community} onChange={onChange} allowLeave />}
    />
  );
}

/** /communities/:roomId — quyết định hiện màn khóa hay phòng chat theo quyền xem (PRD mục 11). */
export function CommunityPage() {
  const { roomId = '' } = useParams();
  const { state, retry } = useCommunity(roomId);
  const [updated, setUpdated] = useState<Community | null>(null);

  if (state.status === 'loading') return <Loading />;
  if (state.status === 'error')
    return (
      <div className={styles.loading}>
        <ErrorState
          title={state.httpStatus === 404 ? 'Không tìm thấy cộng đồng' : 'Không tải được cộng đồng'}
          message={state.message}
          onRetry={state.httpStatus === 404 ? undefined : retry}
        />
      </div>
    );

  const community = updated?.id === roomId ? updated : state.data;
  return canPreview(community) ? (
    <CommunityChat community={community} onChange={setUpdated} />
  ) : (
    <CommunityGate community={community} onChange={setUpdated} />
  );
}
