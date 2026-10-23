// TẠM THỜI
import { Link } from 'react-router';
import { useAuth } from '../features/auth';
import { PagePlaceholder } from './PagePlaceholder';

export function EditProfilePage() {
  const { user } = useAuth();
  const note = user?.profileCompleted
    ? 'Form sửa hồ sơ sẽ có ở bước 7.'
    : 'Hồ sơ của bạn chưa có ngành học. Form hoàn thiện hồ sơ sẽ có ở bước 7.';

  return (
    <PagePlaceholder title="Hoàn thiện / sửa hồ sơ" note={note}>
      <Link to="/">Về trang chủ</Link>
    </PagePlaceholder>
  );
}
