import { z } from 'zod';

export const COMMENT_MAX_LENGTH = 2000;

/**
 * Bình luận của bài viết. Chỉ có 1 cấp trả lời:
 * - parentId = null: bình luận gốc, replyCount là số phản hồi của nó.
 * - parentId = id bình luận gốc: phản hồi (replyCount luôn 0).
 */
export const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  parentId: z.string().nullable(),
  author: z.object({
    id: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  content: z.string(),
  replyCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Comment = z.infer<typeof commentSchema>;

export const commentFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập nội dung bình luận.')
    .max(COMMENT_MAX_LENGTH, `Bình luận tối đa ${COMMENT_MAX_LENGTH} ký tự.`),
});
export type CommentFormInput = z.input<typeof commentFormSchema>;

export interface CommentInput {
  content: string;
  /** null = bình luận gốc; id bình luận gốc = trả lời bình luận đó. */
  parentId: string | null;
}
