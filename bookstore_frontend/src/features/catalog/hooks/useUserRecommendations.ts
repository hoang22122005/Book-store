import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getBookPageData, type Book, type PageResponseDTO } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';
import { useAuth } from '../../../hooks/useAuth';

export const useUserRecommendations = (page = 0, size = 4) => {
  const { isAuthenticated } = useAuth();

  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.recommendations(page, size),
    queryFn: async () => getBookPageData(
      await bookService.getUserRecommendations({ page, size }),
      'Phản hồi gợi ý sách không hợp lệ',
    ),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};
