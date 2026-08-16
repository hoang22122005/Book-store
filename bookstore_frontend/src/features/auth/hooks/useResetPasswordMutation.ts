import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { ResetPasswordRequest } from '../../../types/api';

export function useResetPassword() {
  return useMutation({
    mutationFn: async (request: ResetPasswordRequest) => {
      const response = await authService.resetPassword(request);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Đặt lại mật khẩu thất bại');
      }
      return response.data;
    },
  });
}
