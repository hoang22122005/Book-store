import { useMutation } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { ChangePasswordRequest } from '../../../types/api/user';

export const useChangePassword = () => {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: (data) => userService.changePassword(data),
  });
};
