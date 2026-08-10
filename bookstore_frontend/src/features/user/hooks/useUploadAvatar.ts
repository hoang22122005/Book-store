import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User } from '../services/userService';
import { userQueryKeys } from './useUserProfile';

/**
 * Hook upload avatar.
 *
 * Cách dùng:
 *   const { mutate: uploadAvatar, isPending } = useUploadAvatar();
 *   uploadAvatar(file);            // file: File (lấy từ input[type="file"])
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, File>({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      // Cập nhật cache profile ngay, không cần refetch
      queryClient.setQueryData(userQueryKeys.profile(), updatedUser);
    },
  });
};
