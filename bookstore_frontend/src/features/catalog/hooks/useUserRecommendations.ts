import { useQuery } from '@tanstack/react-query';
import { bookService, type Book, type PageResponseDTO } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';
import { useAuth } from '../../../hooks/useAuth';

export const useUserRecommendations = (page = 0, size = 4) => {
  const { isAuthenticated } = useAuth();

  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.recommendations(page, size),
    queryFn: () => bookService.getUserRecommendations({ page, size }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};
