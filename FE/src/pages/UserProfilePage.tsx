// TẠM THỜI
import { Link, useParams } from 'react-router';
import { PagePlaceholder } from './PagePlaceholder';

export function UserProfilePage() {
  const { userId } = useParams();
  return (
    <PagePlaceholder title="Hồ sơ người khác" note={`Đang xem người dùng có mã "${userId ?? ''}". Trang thật sẽ có ở bước 6.`}>
      <Link to="/">Về trang chủ</Link>
    </PagePlaceholder>
  );
}
