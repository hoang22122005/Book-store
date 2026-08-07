import { useQuery } from '@tanstack/react-query';
import { bookService, type Book, type PageResponseDTO } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useSimilarBooks = (bookId: number, page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.similar(bookId, page, size),
    queryFn: () => bookService.getSimilarRecommendations(bookId, { page, size }),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
};
