import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { ForgotPasswordRequest } from '../../../types/api';

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (request: ForgotPasswordRequest) => {
      const response = await authService.forgotPassword(request);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gửi email thất bại');
      }
      return response.data;
    },
  });
}
