import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { RegisterRequest } from '../../../types/api';

export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const response = await authService.register(credentials);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
      return response.data;
    },
  });
}
