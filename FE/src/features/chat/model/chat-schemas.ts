import { z } from 'zod';

/** Màu của nhãn nhỏ (badge) cạnh tên kênh, vai trò, số đếm. */
export const toneSchema = z.enum(['accent', 'green', 'purple', 'red', 'muted', 'solid']);
export type Tone = z.infer<typeof toneSchema>;

const badgeSchema = z.object({ text: z.string(), tone: toneSchema });
export type Badge = z.infer<typeof badgeSchema>;

/** Icon có sẵn cho kênh; không có thì hiện dấu #. */
export const channelIconSchema = z.enum([
  'hash', 'pin', 'members', 'link', 'folder', 'terminal', 'server', 'palette', 'megaphone', 'calendar',
]);
export type ChannelIcon = z.infer<typeof channelIconSchema>;

export const channelSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: channelIconSchema.nullable(),
  /** Emoji thay icon (kênh của cộng đồng môn học dùng emoji). */
  emoji: z.string().nullable(),
  badge: badgeSchema.nullable(),
  hasUnread: z.boolean(),
});
export type Channel = z.infer<typeof channelSchema>;

export const memberPreviewSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().nullable(),
});
export type MemberPreview = z.infer<typeof memberPreviewSchema>;

/**
 * Phòng chat: Space của nhóm (SPACE) hoặc cộng đồng môn học (COMMUNITY).
 * Hai loại dùng chung cấu trúc Channel → Message theo SRS.
 */
export const chatRoomSchema = z.object({
  id: z.string(),
  kind: z.enum(['SPACE', 'COMMUNITY']),
  name: z.string(),
  badge: badgeSchema,
  subtitle: z.string(),
  description: z.string(),
  channelGroups: z.array(
    z.object({ id: z.string(), name: z.string(), channels: z.array(channelSchema) }),
  ),
  memberCount: z.number(),
  memberPreview: z.array(memberPreviewSchema),
  pinnedCount: z.number(),
  pinned: z.object({ authorName: z.string(), text: z.string() }).nullable(),
  /** Nhãn dưới lời chào kênh (chỉ cộng đồng môn học). */
  highlights: z.array(z.object({ icon: z.enum(['abet', 'syllabus', 'rules']), text: z.string() })),
});
export type ChatRoom = z.infer<typeof chatRoomSchema>;

/** Mục ở thanh bên trái của app: các cộng đồng và nhóm người dùng đang tham gia. */
export const roomSummarySchema = z.object({
  id: z.string(),
  kind: z.enum(['SPACE', 'COMMUNITY']),
  name: z.string(),
  badge: badgeSchema,
});
export type RoomSummary = z.infer<typeof roomSummarySchema>;

const attachmentSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('code'), fileName: z.string(), code: z.string() }),
  z.object({ kind: z.literal('link'), title: z.string(), url: z.string() }),
  z.object({ kind: z.literal('file'), fileName: z.string(), meta: z.string(), ext: z.string() }),
]);
export type Attachment = z.infer<typeof attachmentSchema>;

export const messageSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  /** null = tin nhắn hệ thống. */
  author: z
    .object({
      id: z.string(),
      fullName: z.string(),
      avatarUrl: z.string().nullable(),
      role: badgeSchema.nullable(),
    })
    .nullable(),
  content: z.string(),
  attachment: attachmentSchema.nullable(),
  reactions: z.array(z.object({ emoji: z.string(), count: z.number() })),
  createdAt: z.string(),
});
export type Message = z.infer<typeof messageSchema>;

/** Sự kiện realtime theo PRD mục 24. */
export type ChatEvent =
  | { type: 'MESSAGE_SENT'; message: Message }
  | { type: 'TYPING_START'; channelId: string; userName: string }
  | { type: 'TYPING_STOP'; channelId: string; userName: string };

export const messageInputSchema = z.object({
  content: z.string().trim().min(1, 'Tin nhắn không được để trống.').max(4000, 'Tin nhắn tối đa 4000 ký tự.'),
});
