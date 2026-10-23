import { useNavigate } from 'react-router';
import { useAuth } from '../../auth';
import { profileApi } from '../api';
import { toProfileUpdate, type ProfileFormValues } from '../model/profile-form';

/**
 * Lưu hồ sơ rồi quay về trang hồ sơ.
 * Gọi lại refreshUser() để cập nhật profileCompleted (vừa chọn đủ trường và ngành).
 * Lỗi được ném ra để form hiển thị.
 */
export function useSaveProfile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  return async (values: ProfileFormValues) => {
    await profileApi.updateMyProfile(toProfileUpdate(values));
    await refreshUser();
    await navigate('/profile/me', { replace: true, state: { profileSaved: true } });
  };
}
