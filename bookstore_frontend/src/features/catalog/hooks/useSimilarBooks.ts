import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getBookPageData, type Book, type PageResponseDTO } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useSimilarBooks = (bookId: number, page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.similar(bookId, page, size),
    queryFn: async () => getBookPageData(
      await bookService.getSimilarRecommendations(bookId, { page, size }),
      'Phản hồi sách tương tự không hợp lệ',
    ),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
};
