import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuth } from '../../../hooks/useAuth';
import { formatUserData, tokenStorage } from '../../../utils';
import type { LoginRequest } from '../../../types/api';

type LoginCredentials = LoginRequest & { rememberMe?: boolean };

export function useLogin() {
  const auth = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      const payload = response.data;
      if (!payload.success || !payload.data) {
        throw new Error(payload.message || 'Đăng nhập thất bại');
      }

      const { accessToken, refreshToken, user } = payload.data;
      if (!accessToken || !refreshToken || !user) {
        throw new Error(payload.message || 'Phản hồi đăng nhập không hợp lệ');
      }

      tokenStorage.setTokens(accessToken, refreshToken, credentials.rememberMe);
      const formattedUser = formatUserData(user);
      auth.setUser(formattedUser);
      return formattedUser;
    },
  });
}
