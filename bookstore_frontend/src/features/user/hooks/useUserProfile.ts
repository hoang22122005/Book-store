import { useQuery } from '@tanstack/react-query';
import { userService, type User } from '../services/userService';
import { tokenStorage } from '../../../utils';

export const userQueryKeys = {
  all: ['user'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
};

export const useUserProfile = () => {
  const token = tokenStorage.getAccessToken();

  return useQuery<User, Error>({
    queryKey: userQueryKeys.profile(),
    queryFn: () => userService.getProfile(),
    staleTime: 1000 * 60 * 5,
    enabled: !!token,
  });
};
