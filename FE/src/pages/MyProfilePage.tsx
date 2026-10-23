// TẠM THỜI
import { Link } from 'react-router';
import { PagePlaceholder } from './PagePlaceholder';

export function MyProfilePage() {
  return (
    <PagePlaceholder title="Hồ sơ của tôi" note="Trang xem hồ sơ sẽ có ở bước 6.">
      <Link to="/">Về trang chủ</Link>
    </PagePlaceholder>
  );
}
