import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import { catalogQueryKeys } from '../../catalog/hooks/useBooksQuery';

export const userQueryKeys = {
  profile: ['user', 'profile'] as const,
  genrePreferences: ['user', 'genrePreferences'] as const,
};

export const useGenrePreferences = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<number[], Error>({
    queryKey: userQueryKeys.genrePreferences,
    queryFn: () => userService.getGenrePreferences(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
};

export const useSaveGenrePreferences = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (genreIds: number[]) => userService.saveGenrePreferences(genreIds),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(userQueryKeys.profile, updatedUser);
      queryClient.setQueryData(userQueryKeys.genrePreferences, updatedUser.preferredGenreIds || []);
      // Invalidate recommendations so the UI refreshes instantly
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
    },
  });
};
