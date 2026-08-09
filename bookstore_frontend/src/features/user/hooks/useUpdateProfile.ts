import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User } from '../services/userService';
import { userQueryKeys } from './useUserProfile';
import type { UpdateUserRequest } from '../../../types/api/user';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserRequest>({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(userQueryKeys.profile(), updatedUser);
    },
  });
};
