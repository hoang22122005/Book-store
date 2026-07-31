import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { formatUserData, tokenStorage } from '../../../utils';

export function useProfile(enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const res = await authService.getProfile();
      if (!res.data.success) {
        throw new Error(res.data.message || 'Không thể lấy thông tin cá nhân');
      }
      if (!res.data.data) {
        throw new Error(res.data.message || 'Không thể lấy thông tin cá nhân');
      }
      return formatUserData(res.data.data);
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
