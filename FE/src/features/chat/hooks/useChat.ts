import { useCallback, useEffect, useState } from 'react';
import { useAsyncData } from '../../../shared/hooks/use-async-data';
import { chatApi } from '../api';
import type { ChatRoom, Message } from '../model/chat-schemas';

export function useMyRooms() {
  return useAsyncData('chat:my-rooms', (signal) => chatApi.getMyRooms(signal));
}

export function useChatRoom(kind: ChatRoom['kind'], roomId: string) {
  return useAsyncData(`chat:room:${kind}:${roomId}`, (signal) => chatApi.getRoom(kind, roomId, signal));
}

/**
 * Tin nhắn của một kênh: tải lịch sử, nghe sự kiện realtime, gửi tin.
 * Tin realtime trùng id với tin đã có (ví dụ tin mình vừa gửi) thì bỏ qua.
 */
export function useChannelMessages(channelId: string) {
  const { state, retry } = useAsyncData(`chat:messages:${channelId}`, (signal) =>
    chatApi.getMessages(channelId, signal),
  );
  const [live, setLive] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    setLive([]);
    setTypingUsers([]);
    return chatApi.subscribe(channelId, (event) => {
      if (event.type === 'MESSAGE_SENT') setLive((list) => [...list, event.message]);
      else if (event.type === 'TYPING_START')
        setTypingUsers((names) => (names.includes(event.userName) ? names : [...names, event.userName]));
      else setTypingUsers((names) => names.filter((name) => name !== event.userName));
    });
  }, [channelId]);

  const send = useCallback(
    async (content: string) => {
      const message = await chatApi.sendMessage(channelId, content);
      setLive((list) => [...list, message]);
    },
    [channelId],
  );

  const history = state.status === 'success' ? state.data : [];
  const seen = new Set(history.map((message) => message.id));
  const messages = [...history, ...live.filter((message) => !seen.has(message.id) && seen.add(message.id))];

  return { state, retry, messages, typingUsers, send };
}
