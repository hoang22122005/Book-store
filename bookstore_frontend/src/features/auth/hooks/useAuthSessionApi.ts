import { useCallback } from 'react';
import { authService } from '../services/authService';
import { formatUserData } from '../../../utils';

export function useAuthSessionApi() {
  const getProfile = useCallback(async () => {
    const response = await authService.getProfile();
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Không thể lấy thông tin cá nhân');
    }
    return formatUserData(response.data.data);
  }, []);

  const notifyLogout = useCallback(async (refreshToken?: string) => {
    const response = await authService.logout(refreshToken);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể đăng xuất');
    }
  }, []);

  return { getProfile, notifyLogout };
}
