// Gọi Chat API thật: REST cho dữ liệu, WebSocket cho sự kiện realtime.
import { z } from 'zod';
import { request } from '../../../services/http-client';
import {
  chatRoomSchema,
  messageSchema,
  roomSummarySchema,
  type ChatEvent,
  type ChatRoom,
  type Message,
  type RoomSummary,
} from '../model/chat-schemas';

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/^http/, 'ws');

function roomPath(kind: ChatRoom['kind'], roomId: string) {
  return `/${kind === 'SPACE' ? 'spaces' : 'communities'}/${encodeURIComponent(roomId)}`;
}

/** Các cộng đồng và nhóm mà người dùng đang tham gia (hiện ở thanh bên trái). */
export async function getMyRooms(signal?: AbortSignal): Promise<RoomSummary[]> {
  return z.array(roomSummarySchema).parse(await request('/me/rooms', { signal }));
}

export async function getRoom(kind: ChatRoom['kind'], roomId: string, signal?: AbortSignal): Promise<ChatRoom> {
  return chatRoomSchema.parse(await request(roomPath(kind, roomId), { signal }));
}

export async function getMessages(channelId: string, signal?: AbortSignal): Promise<Message[]> {
  const data = await request(`/channels/${encodeURIComponent(channelId)}/messages`, { signal });
  return z.array(messageSchema).parse(data);
}

export async function sendMessage(channelId: string, content: string): Promise<Message> {
  const data = await request(`/channels/${encodeURIComponent(channelId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return messageSchema.parse(data);
}

/**
 * Nghe sự kiện realtime của một kênh. Trả về hàm hủy đăng ký.
 * Quy ước với BE: mỗi frame là JSON { type, ... } theo kiểu ChatEvent.
 */
export function subscribe(channelId: string, onEvent: (event: ChatEvent) => void): () => void {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/channels/${encodeURIComponent(channelId)}`);
  socket.onmessage = (frame) => {
    try {
      const event = JSON.parse(String(frame.data)) as ChatEvent;
      if (event.type === 'MESSAGE_SENT') onEvent({ ...event, message: messageSchema.parse(event.message) });
      else onEvent(event);
    } catch {
      // Bỏ qua frame sai định dạng thay vì làm sập màn hình chat.
    }
  };
  return () => socket.close();
}
