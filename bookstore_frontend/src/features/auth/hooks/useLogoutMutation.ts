import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';

export function useLogout() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await auth.logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
