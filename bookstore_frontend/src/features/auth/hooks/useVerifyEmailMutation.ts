import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await authService.verifyEmail(token);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Xác minh email thất bại');
      }
      return response.data;
    },
  });
}
