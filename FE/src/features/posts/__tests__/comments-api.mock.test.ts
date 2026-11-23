import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDb } from '../../../test/mock-db';
import * as commentsApi from '../api/comments-api.mock';
import * as postsApi from '../api/posts-api.mock';

const DEMO_USER = 'u-demo';
const OTHER_USER = 'u-khac';

async function newPost() {
  return postsApi.createPost({
    type: 'GENERAL',
    content: 'Bài viết dùng để thử bình luận',
    tags: [],
    subject: '',
    classCode: '',
    semester: null,
    lecturer: null,
  });
}

describe('mock comments API', () => {
  beforeEach(() => {
    vi.spyOn(mockDb, 'delay').mockResolvedValue(undefined);
    mockDb.session.start(DEMO_USER);
  });

  it('bài viết mẫu có commentCount khớp với số bình luận mẫu', async () => {
    const { items } = await postsApi.listPosts({ limit: 100 });
    for (const post of items) {
      const top = await commentsApi.listComments(post.id, { limit: 100 });
      const replies = top.items.reduce((sum, comment) => sum + comment.replyCount, 0);
      expect(top.items.length + replies).toBe(post.commentCount);
    }
  });

  it('tạo bình luận gốc: tăng commentCount và hiện đầu danh sách', async () => {
    const post = await newPost();
    const comment = await commentsApi.createComment(post.id, { content: 'Mình quan tâm!', parentId: null });

    expect(comment).toMatchObject({ postId: post.id, parentId: null, content: 'Mình quan tâm!', replyCount: 0 });
    expect(comment.author.id).toBe(DEMO_USER);
    expect((await postsApi.getPost(post.id)).commentCount).toBe(1);
    expect((await commentsApi.listComments(post.id, {})).items[0].id).toBe(comment.id);
  });

  it('trả lời bình luận: tăng replyCount của cha và commentCount của bài', async () => {
    const post = await newPost();
    const parent = await commentsApi.createComment(post.id, { content: 'Câu hỏi', parentId: null });
    const reply = await commentsApi.createComment(post.id, { content: 'Trả lời', parentId: parent.id });

    expect(reply.parentId).toBe(parent.id);
    const top = await commentsApi.listComments(post.id, {});
    expect(top.items).toHaveLength(1); // reply không nằm ở danh sách gốc
    expect(top.items[0].replyCount).toBe(1);
    expect((await commentsApi.listComments(post.id, { parentId: parent.id })).items.map((c) => c.id)).toEqual([reply.id]);
    expect((await postsApi.getPost(post.id)).commentCount).toBe(2);
  });

  it('phản hồi xếp cũ trước, bình luận gốc xếp mới trước', async () => {
    const post = await newPost();
    const a = await commentsApi.createComment(post.id, { content: 'A', parentId: null });
    const b = await commentsApi.createComment(post.id, { content: 'B', parentId: null });
    const r1 = await commentsApi.createComment(post.id, { content: 'R1', parentId: a.id });
    const r2 = await commentsApi.createComment(post.id, { content: 'R2', parentId: a.id });

    expect((await commentsApi.listComments(post.id, {})).items.map((c) => c.id)).toEqual([b.id, a.id]);
    expect((await commentsApi.listComments(post.id, { parentId: a.id })).items.map((c) => c.id)).toEqual([r1.id, r2.id]);
  });

  it('không cho trả lời một phản hồi (chỉ 1 cấp)', async () => {
    const post = await newPost();
    const parent = await commentsApi.createComment(post.id, { content: 'Gốc', parentId: null });
    const reply = await commentsApi.createComment(post.id, { content: 'Con', parentId: parent.id });
    await expect(commentsApi.createComment(post.id, { content: 'Cháu', parentId: reply.id })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('báo 404 khi bình luận vào bài không tồn tại', async () => {
    await expect(commentsApi.createComment('khong-ton-tai', { content: 'Hi', parentId: null })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('phân trang bình luận gốc', async () => {
    const post = await newPost();
    for (const text of ['1', '2', '3']) await commentsApi.createComment(post.id, { content: text, parentId: null });
    const first = await commentsApi.listComments(post.id, { limit: 2 });
    expect(first.items.map((c) => c.content)).toEqual(['3', '2']);
    const second = await commentsApi.listComments(post.id, { limit: 2, cursor: first.nextCursor });
    expect(second.items.map((c) => c.content)).toEqual(['1']);
    expect(second.nextCursor).toBeNull();
  });

  it('sửa bình luận của mình', async () => {
    const post = await newPost();
    const comment = await commentsApi.createComment(post.id, { content: 'Cũ', parentId: null });
    const updated = await commentsApi.updateComment(comment.id, { content: 'Mới' });
    expect(updated.content).toBe('Mới');
    expect(updated.updatedAt >= comment.updatedAt).toBe(true);
  });

  it('không cho sửa/xóa bình luận của người khác (403)', async () => {
    const post = await newPost();
    const comment = await commentsApi.createComment(post.id, { content: 'Của demo', parentId: null });
    mockDb.session.start(OTHER_USER);
    await expect(commentsApi.updateComment(comment.id, { content: 'Hack' })).rejects.toMatchObject({ status: 403 });
    await expect(commentsApi.deleteComment(comment.id)).rejects.toMatchObject({ status: 403 });
  });

  it('xóa bình luận gốc xóa luôn phản hồi và giảm commentCount tương ứng', async () => {
    const post = await newPost();
    const parent = await commentsApi.createComment(post.id, { content: 'Gốc', parentId: null });
    await commentsApi.createComment(post.id, { content: 'R1', parentId: parent.id });
    mockDb.session.start(OTHER_USER);
    await commentsApi.createComment(post.id, { content: 'R2 của người khác', parentId: parent.id });
    mockDb.session.start(DEMO_USER);

    await commentsApi.deleteComment(parent.id);

    expect((await commentsApi.listComments(post.id, {})).items).toHaveLength(0);
    expect((await postsApi.getPost(post.id)).commentCount).toBe(0);
  });

  it('xóa phản hồi giảm replyCount của cha', async () => {
    const post = await newPost();
    const parent = await commentsApi.createComment(post.id, { content: 'Gốc', parentId: null });
    const reply = await commentsApi.createComment(post.id, { content: 'Con', parentId: parent.id });
    await commentsApi.deleteComment(reply.id);
    expect((await commentsApi.listComments(post.id, {})).items[0].replyCount).toBe(0);
    expect((await postsApi.getPost(post.id)).commentCount).toBe(1);
  });

  it('xóa bài viết thì bình luận của bài cũng bị xóa', async () => {
    const post = await newPost();
    await commentsApi.createComment(post.id, { content: 'Gốc', parentId: null });
    await postsApi.deletePost(post.id);
    await expect(commentsApi.listComments(post.id, {})).rejects.toMatchObject({ status: 404 });
  });
});
