import { Button, IconAlertCircle } from '../../../shared/ui';
import styles from './ProfileForm.module.css';

interface UnsavedChangesBarProps {
  isVisible: boolean;
  isSaving: boolean;
  onDiscard: () => void;
}

/** Thanh dính ở đáy màn hình khi form có thay đổi chưa lưu. Đặt bên trong <form> để nút Lưu gửi được form. */
export function UnsavedChangesBar({ isVisible, isSaving, onDiscard }: UnsavedChangesBarProps) {
  if (!isVisible) return null;

  return (
    <div className={styles.unsavedBar} role="region" aria-label="Thay đổi chưa lưu">
      <p className={styles.unsavedText}>
        <IconAlertCircle />
        Bạn có thay đổi chưa được lưu.
      </p>
      <div className={styles.unsavedActions}>
        <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
          Hủy thay đổi
        </Button>
        <Button type="submit" isLoading={isSaving} loadingText="Đang lưu…">
          Lưu cập nhật hồ sơ
        </Button>
      </div>
    </div>
  );
}
