// Mock Post API, dùng khi VITE_USE_MOCK_API=true. Cùng chữ ký hàm với posts-api.ts.
import { ApiError } from '../../../services/http-client';
import type { Page } from '../../../shared/lib/pagination';
import { mockDb } from '../../../test/mock-db';
import type { Post, PostInput } from '../model/post-schemas';
import type { PostQuery } from './posts-api';
import { findPost, mockStore, nowIso, paginate, requireSession } from './posts-mock-store';

const DEFAULT_LIMIT = 10;

/** Giống BE: chỉ tác giả mới được sửa/xóa bài của mình. */
function findOwnPost(posts: Post[], postId: string, userId: string) {
  const post = findPost(posts, postId);
  if (post.author.id !== userId) throw new ApiError(403, 'Bạn không có quyền chỉnh sửa bài viết này.');
  return post;
}

function applyInput(input: PostInput): Pick<Post, 'type' | 'content' | 'tags' | 'course'> {
  return {
    type: input.type,
    content: input.content,
    tags: input.tags,
    course: input.subject
      ? { subject: input.subject, classCode: input.classCode, semester: input.semester, lecturer: input.lecturer }
      : null,
  };
}

export async function listPosts(query: PostQuery = {}, signal?: AbortSignal): Promise<Page<Post>> {
  await mockDb.delay(400);
  signal?.throwIfAborted();
  requireSession();
  const keyword = query.subject?.trim().toLowerCase();
  const { posts } = mockStore.load();
  const matched = keyword
    ? posts.filter((post) =>
        [post.course?.subject, post.course?.classCode, post.title, ...post.tags].some((text) =>
          text?.toLowerCase().includes(keyword),
        ),
      )
    : posts;
  return paginate(matched, 'desc', query.cursor, query.limit ?? DEFAULT_LIMIT);
}

export async function getPost(postId: string, signal?: AbortSignal): Promise<Post> {
  await mockDb.delay(300);
  signal?.throwIfAborted();
  requireSession();
  return findPost(mockStore.load().posts, postId);
}

export async function createPost(input: PostInput): Promise<Post> {
  await mockDb.delay(500);
  const userId = requireSession();
  const profile = mockDb.getProfile(userId);
  const now = nowIso();
  const post: Post = {
    id: crypto.randomUUID(),
    author: {
      id: userId,
      fullName: profile?.fullName ?? 'Bạn',
      avatarUrl: profile?.avatarUrl ?? null,
      headline: profile?.major?.name ?? null,
      cohort: profile?.cohort ?? null,
    },
    title: null,
    ...applyInput(input),
    recruitment: null,
    studyGroup: null,
    seeking: null,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
    createdAt: now,
    updatedAt: now,
  };
  const data = mockStore.load();
  mockStore.save({ ...data, posts: [post, ...data.posts] });
  return post;
}

export async function updatePost(postId: string, input: PostInput): Promise<Post> {
  await mockDb.delay(500);
  const userId = requireSession();
  const data = mockStore.load();
  const post = findOwnPost(data.posts, postId, userId);
  Object.assign(post, applyInput(input), { updatedAt: nowIso() });
  mockStore.save(data);
  return post;
}

/** Xóa bài thì xóa luôn bình luận của bài. */
export async function deletePost(postId: string): Promise<void> {
  await mockDb.delay(400);
  const userId = requireSession();
  const data = mockStore.load();
  findOwnPost(data.posts, postId, userId);
  mockStore.save({
    posts: data.posts.filter((post) => post.id !== postId),
    comments: data.comments.filter((comment) => comment.postId !== postId),
  });
}

export async function toggleLike(postId: string): Promise<Post> {
  await mockDb.delay(150);
  requireSession();
  const data = mockStore.load();
  const post = findPost(data.posts, postId);
  post.likedByMe = !post.likedByMe;
  post.likeCount += post.likedByMe ? 1 : -1;
  mockStore.save(data);
  return post;
}
