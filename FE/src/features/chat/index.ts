// Public API của feature chat (chat nhóm trong Space và chat cộng đồng môn học).
export { ChatWorkspace } from './components/ChatWorkspace';
export { useChatRoom, useMyRooms } from './hooks/useChat';
export type { ChatRoom, RoomSummary } from './model/chat-schemas';
