import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getErrorMessage } from '../../../services/http-client';
import { ConfirmDialog, ErrorState, Skeleton } from '../../../shared/ui';
import { useAuth } from '../../auth';
import { adminUsersApi } from '../api';
import { useDirectoryStats } from '../hooks/useDirectoryStats';
import { useUserList } from '../hooks/useUserList';
import { useUserListQuery } from '../hooks/useUserListQuery';
import type { AdminUser, UserPatchResult } from '../model/admin-user-schemas';
import { BulkActionBar } from './BulkActionBar';
import { DirectoryHeader } from './DirectoryHeader';
import { DirectoryStatsGrid } from './DirectoryStatsGrid';
import { Pagination } from './Pagination';
import { UserDrawer } from './UserDrawer';
import { UserFilters } from './UserFilters';
import { UserRowActions } from './UserRowActions';
import { UserTable } from './UserTable';
import styles from './UserDirectory.module.css';

type PendingAction = { kind: 'status' | 'role'; user: AdminUser };

/** Nội dung hộp thoại xác nhận cho từng thao tác. */
function describeAction({ kind, user }: PendingAction) {
  const name = user.fullName;
  if (kind === 'status') {
    return user.status === 'BANNED'
      ? {
          title: 'Mở khóa tài khoản?',
          message: `${name} sẽ đăng nhập và sử dụng UniSpace bình thường trở lại.`,
          confirmLabel: 'Mở khóa',
        }
      : {
          title: 'Khóa tài khoản?',
          message: `Tài khoản của ${name} sẽ không đăng nhập được cho tới khi được mở khóa.`,
          confirmLabel: 'Khóa tài khoản',
        };
  }
  return user.role === 'ADMIN'
    ? {
        title: 'Bỏ quyền Quản trị viên?',
        message: `${name} sẽ trở về tài khoản sinh viên thường và không vào được khu vực quản trị.`,
        confirmLabel: 'Bỏ quyền',
      }
    : {
        title: 'Cấp quyền Quản trị viên?',
        message: `${name} sẽ vào được khu vực quản trị và thao tác được trên tài khoản người khác.`,
        confirmLabel: 'Cấp quyền',
      };
}

function TableSkeleton() {
  return (
    <div className={styles.tableSkeleton} aria-label="Đang tải danh sách người dùng" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} height="56px" />
      ))}
    </div>
  );
}

/** Trang Admin quản lý người dùng (Figma 25:5350). */
export function UserDirectory() {
  const { user: me } = useAuth();
  const { query, setQuery } = useUserListQuery();
  const { state, retry } = useUserList(query);
  const { state: statsState } = useDirectoryStats();
  const [params, setParams] = useSearchParams();
  const detailUserId = params.get('user');

  // Kết quả PATCH gộp vào hàng đang hiển thị (không tải lại cả trang).
  const [patches, setPatches] = useState<Record<string, UserPatchResult>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Đổi trang hoặc bộ lọc: bỏ chọn và bỏ bản vá cũ (dữ liệu mới đã có thay đổi).
  const queryKey = JSON.stringify(query);
  useEffect(() => {
    setSelectedIds(new Set());
    setPatches({});
  }, [queryKey]);

  const users = state.status === 'success' ? state.data.items.map((user) => ({ ...user, ...patches[user.id] })) : [];

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = () => {
    setSelectedIds((current) => (users.every((user) => current.has(user.id)) ? new Set() : new Set(users.map((user) => user.id))));
  };

  const openDetail = (id: string) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.set('user', id);
      return next;
    });
  };

  const closeDetail = useCallback(() => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('user');
      return next;
    });
  }, [setParams]);

  const closeDialog = () => {
    setPending(null);
    setActionError(null);
  };

  const confirmAction = async () => {
    if (!pending) return;
    const { kind, user } = pending;
    setIsBusy(true);
    setActionError(null);
    try {
      const result =
        kind === 'status'
          ? await adminUsersApi.updateUserStatus(user.id, user.status === 'BANNED' ? 'ACTIVE' : 'BANNED')
          : await adminUsersApi.updateUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN');
      setPatches((current) => ({ ...current, [user.id]: result }));
      setPending(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const dialog = pending && describeAction(pending);

  return (
    <div className={styles.page}>
      <DirectoryHeader total={state.status === 'success' ? state.data.pagination.total : null} />
      <DirectoryStatsGrid stats={statsState.status === 'success' ? statsState.data : null} />
      <UserFilters query={query} onChange={setQuery} />
      <BulkActionBar count={selectedIds.size} />

      <section className={styles.tableCard}>
        {state.status === 'loading' && <TableSkeleton />}
        {state.status === 'error' && (
          <ErrorState title="Không tải được danh sách người dùng" message={state.message} onRetry={retry} />
        )}
        {state.status === 'success' &&
          (users.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Không tìm thấy người dùng phù hợp</p>
              <p className={styles.muted}>Thử đổi từ khóa tìm kiếm hoặc bỏ bớt bộ lọc.</p>
            </div>
          ) : (
            <>
              <div className={styles.tableScroll}>
                <UserTable
                  users={users}
                  selectedIds={selectedIds}
                  onToggle={toggleOne}
                  onToggleAll={toggleAll}
                  onOpen={openDetail}
                  renderActions={(user) => (
                    <UserRowActions
                      user={user}
                      isSelf={user.id === me?.id}
                      onView={() => openDetail(user.id)}
                      onToggleStatus={() => setPending({ kind: 'status', user })}
                      onToggleRole={() => setPending({ kind: 'role', user })}
                    />
                  )}
                />
              </div>
              <Pagination
                pagination={state.data.pagination}
                onPage={(page) => setQuery({ page })}
                onLimit={(limit) => setQuery({ limit })}
              />
            </>
          ))}
      </section>

      {detailUserId && <UserDrawer key={detailUserId} userId={detailUserId} onClose={closeDetail} />}

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          isBusy={isBusy}
          error={actionError}
          onConfirm={() => void confirmAction()}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
