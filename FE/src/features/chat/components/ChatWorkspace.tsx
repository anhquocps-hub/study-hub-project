import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import iconCalendar from '../../../assets/figma/com-calendar.svg';
import iconChevron from '../../../assets/figma/chat-chevron.svg';
import iconFolder from '../../../assets/figma/chat-folder.svg';
import iconHashActive from '../../../assets/figma/chat-hash-active.svg';
import iconHash from '../../../assets/figma/chat-hash.svg';
import iconInvite from '../../../assets/figma/chat-invite.svg';
import iconLink from '../../../assets/figma/chat-link.svg';
import iconMembers from '../../../assets/figma/chat-members.svg';
import iconPalette from '../../../assets/figma/chat-palette.svg';
import iconPinSmall from '../../../assets/figma/chat-pin-small.svg';
import iconPin from '../../../assets/figma/chat-pin.svg';
import iconSearch from '../../../assets/figma/chat-search.svg';
import iconServer from '../../../assets/figma/chat-server.svg';
import iconSettings from '../../../assets/figma/chat-settings.svg';
import iconTerminal from '../../../assets/figma/chat-terminal.svg';
import iconAbet from '../../../assets/figma/com-abet.svg';
import iconArrow from '../../../assets/figma/com-arrow.svg';
import iconClose from '../../../assets/figma/com-close.svg';
import iconDatabase from '../../../assets/figma/com-database.svg';
import iconComMembers from '../../../assets/figma/com-members.svg';
import iconMegaphone from '../../../assets/figma/com-megaphone.svg';
import iconPinBanner from '../../../assets/figma/com-pin-banner.svg';
import iconComPin from '../../../assets/figma/com-pin.svg';
import iconRules from '../../../assets/figma/com-rules.svg';
import iconComSettings from '../../../assets/figma/com-settings.svg';
import iconSyllabus from '../../../assets/figma/com-syllabus.svg';
import { Avatar, ErrorState, Skeleton } from '../../../shared/ui';
import { useChannelMessages } from '../hooks/useChat';
import type { Channel, ChannelIcon, ChatRoom } from '../model/chat-schemas';
import { ChatComposer } from './ChatComposer';
import { MessageItem } from './MessageItem';
import styles from './ChatWorkspace.module.css';

const CHANNEL_ICONS: Record<ChannelIcon, string> = {
  hash: iconHashActive,
  pin: iconPin,
  members: iconMembers,
  link: iconLink,
  folder: iconFolder,
  terminal: iconTerminal,
  server: iconServer,
  palette: iconPalette,
  megaphone: iconMegaphone,
  calendar: iconCalendar,
};
const HIGHLIGHT_ICONS = { abet: iconAbet, syllabus: iconSyllabus, rules: iconRules };

const compactCount = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}k` : String(count);

function ChannelLink({ channel, active, kind, onSelect }: { channel: Channel; active: boolean; kind: ChatRoom['kind']; onSelect: () => void }) {
  const leading = channel.emoji ? (
    <span className={styles.channelEmoji} aria-hidden="true">{channel.emoji}</span>
  ) : channel.icon ? (
    <img src={CHANNEL_ICONS[channel.icon]} alt="" className={styles.channelIcon} />
  ) : (
    <span className={styles.channelHash} aria-hidden="true">#</span>
  );

  return (
    <button
      type="button"
      className={active ? `${styles.channel} ${styles.channelActive}` : styles.channel}
      aria-current={active ? 'page' : undefined}
      onClick={onSelect}
    >
      <span className={styles.channelLabel}>
        {active && kind === 'COMMUNITY' && <span className={styles.activeDot} aria-hidden="true" />}
        {leading}
        <span className={styles.channelName}>{channel.name}</span>
      </span>
      {channel.badge && !active && (
        <span className={`${styles.badge} ${styles[channel.badge.tone]}`}>{channel.badge.text}</span>
      )}
      {(active || (channel.hasUnread && !channel.badge)) && (
        <span className={styles.unreadDot} aria-label={active ? undefined : 'Có tin mới'} />
      )}
    </button>
  );
}

function Sidebar({ room, activeId, onSelect }: { room: ChatRoom; activeId: string; onSelect: (id: string) => void }) {
  const isCommunity = room.kind === 'COMMUNITY';
  return (
    <aside className={styles.sidebar} aria-label={`Kênh của ${room.name}`}>
      <div className={styles.roomHead}>
        <div className={styles.roomTitleRow}>
          <div className={styles.roomTitle}>
            <h2 className={styles.roomName}>{room.name}</h2>
            <span className={`${styles.badge} ${styles.roomBadge} ${styles[room.badge.tone]}`}>{room.badge.text}</span>
          </div>
          <button type="button" className={styles.iconBtn} aria-label="Cài đặt">
            <img src={isCommunity ? iconComSettings : iconSettings} alt="" />
          </button>
        </div>
        <p className={styles.roomSubtitle}>{room.subtitle}</p>
        {isCommunity && (
          <button type="button" className={styles.inviteWide}>
            <img src={iconInvite} alt="" />+ Mời bạn cùng lớp
          </button>
        )}
      </div>
      <nav className={styles.channelTree}>
        {room.channelGroups.map((group) => (
          <section key={group.id} className={styles.group}>
            <h3 className={styles.groupName}>
              {!isCommunity && <img src={iconChevron} alt="" className={styles.chevron} />}
              {group.name}
              {isCommunity && <img src={iconChevron} alt="" className={styles.chevron} />}
            </h3>
            <div className={styles.channels}>
              {group.channels.map((channel) => (
                <ChannelLink
                  key={channel.id}
                  channel={channel}
                  kind={room.kind}
                  active={channel.id === activeId}
                  onSelect={() => onSelect(channel.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}

function MemberStack({ room }: { room: ChatRoom }) {
  return (
    <span className={styles.stack}>
      {room.memberPreview.map((member) => (
        <Avatar key={member.id} name={member.fullName} src={member.avatarUrl} className={styles.stackAvatar} />
      ))}
      {room.kind === 'COMMUNITY' && room.memberCount > room.memberPreview.length && (
        <span className={styles.stackMore}>+{compactCount(room.memberCount - room.memberPreview.length)}</span>
      )}
    </span>
  );
}

interface ChatWorkspaceProps {
  room: ChatRoom;
}

/** Màn hình chat dùng chung cho Không gian nhóm (SPACE) và Cộng đồng môn học (COMMUNITY). */
export function ChatWorkspace({ room }: ChatWorkspaceProps) {
  const isCommunity = room.kind === 'COMMUNITY';
  const allChannels = useMemo(() => room.channelGroups.flatMap((group) => group.channels), [room]);
  const [searchParams, setSearchParams] = useSearchParams();
  const channel = allChannels.find((item) => item.id === searchParams.get('channel')) ?? allChannels[0];
  const { state, retry, messages, typingUsers, send } = useChannelMessages(channel.id);
  const [query, setQuery] = useState('');
  const [showPinned, setShowPinned] = useState(true);
  const streamRef = useRef<HTMLDivElement>(null);

  const visible = query.trim()
    ? messages.filter((message) => message.content.toLowerCase().includes(query.trim().toLowerCase()))
    : messages;

  useEffect(() => {
    const stream = streamRef.current;
    if (stream) stream.scrollTop = stream.scrollHeight; // luôn cuộn tới tin mới nhất
  }, [visible.length, typingUsers.length, channel.id]);

  const selectChannel = (id: string) => {
    setQuery('');
    setSearchParams({ channel: id }, { replace: true });
  };

  return (
    <div className={`${styles.root} ${isCommunity ? styles.community : styles.space}`}>
      <Sidebar room={room} activeId={channel.id} onSelect={selectChannel} />

      <section className={styles.main} aria-label={`Kênh #${channel.name}`}>
        <header className={styles.topBar}>
          <div className={styles.topLeft}>
            <h1 className={styles.channelTitle}>
              {isCommunity ? <span className={styles.titleHash}>#</span> : <img src={iconHash} alt="" />}
              {channel.name}
            </h1>
            {isCommunity && (
              <div className={styles.tabs}>
                <span className={styles.tab}>
                  <img src={iconComMembers} alt="" />
                  Giảng viên &amp; Sinh viên
                  <span className={styles.tabCount}>{room.memberCount.toLocaleString('vi-VN')}</span>
                </span>
                <span className={`${styles.tab} ${styles.tabGreen}`}>
                  <img src={iconComPin} alt="" />
                  {room.pinnedCount} ghim
                </span>
              </div>
            )}
          </div>
          <div className={styles.topRight}>
            {!isCommunity && (
              <span className={styles.pinCount}>
                <img src={iconPinSmall} alt="" />
                {room.pinnedCount} ghim
              </span>
            )}
            <label className={styles.search}>
              <img src={iconSearch} alt="" className={styles.searchIcon} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isCommunity ? 'Tìm kiếm tin nhắn, tài liệu...' : 'Tìm kiếm tin nhắn...'}
                aria-label="Tìm kiếm tin nhắn"
              />
            </label>
            <span className={styles.people}>
              <MemberStack room={room} />
              <button type="button" className={styles.invite}>
                {!isCommunity && <img src={iconInvite} alt="" />}
                {isCommunity ? 'Mời bạn' : 'Mời'}
              </button>
            </span>
          </div>
        </header>

        {isCommunity && room.pinned && showPinned && (
          <div className={styles.pinned}>
            <img src={iconPinBanner} alt="" className={styles.pinnedIcon} />
            <p className={styles.pinnedText}>
              <strong>Ghim từ {room.pinned.authorName}:</strong>
              <span>{room.pinned.text}</span>
            </p>
            <button type="button" className={styles.pinnedCta}>
              Xem ngay <img src={iconArrow} alt="" />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Ẩn tin ghim" onClick={() => setShowPinned(false)}>
              <img src={iconClose} alt="" />
            </button>
          </div>
        )}

        <div className={styles.stream} ref={streamRef} aria-live="polite">
          {isCommunity && (
            <div className={styles.welcome}>
              <span className={styles.welcomeIcon}>
                <img src={iconDatabase} alt="" />
              </span>
              <h2 className={styles.welcomeTitle}>
                Chào mừng đến với <span>#{channel.name}</span>!
              </h2>
              <p className={styles.welcomeText}>{room.description}</p>
              {room.highlights.length > 0 && (
                <div className={styles.highlights}>
                  {room.highlights.map((item) => (
                    <span key={item.icon} className={styles.highlight}>
                      <img src={HIGHLIGHT_ICONS[item.icon]} alt="" />
                      {item.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {state.status === 'loading' && (
            <div className={styles.loading} role="status" aria-label="Đang tải tin nhắn">
              <Skeleton height="64px" />
              <Skeleton height="64px" />
            </div>
          )}
          {state.status === 'error' && (
            <ErrorState title="Không tải được tin nhắn" message={state.message} onRetry={retry} />
          )}
          {state.status === 'success' && (
            <>
              {visible.length > 0 && (
                <div className={styles.dateSep}>
                  <span>{isCommunity ? `Hôm nay - ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}` : 'Hôm nay'}</span>
                </div>
              )}
              {visible.map((message) => (
                <MessageItem key={message.id} message={message} kind={room.kind} />
              ))}
              {visible.length === 0 && (
                <p className={styles.empty}>
                  {query ? 'Không có tin nhắn nào khớp từ khóa.' : 'Chưa có tin nhắn nào. Hãy mở đầu cuộc trò chuyện!'}
                </p>
              )}
            </>
          )}

          {typingUsers.length > 0 && (
            <div className={styles.typing}>
              <span className={styles.typingDots} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>{typingUsers.join(', ')}</strong> đang nhập câu trả lời...
              </span>
            </div>
          )}
        </div>

        <ChatComposer kind={room.kind} channelName={channel.name} onSend={send} />
      </section>
    </div>
  );
}
