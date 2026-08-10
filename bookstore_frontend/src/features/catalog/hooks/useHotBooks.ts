import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getBookPageData, type Book, type PageResponseDTO } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useHotBooks = (page = 0, size = 3) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.hot(page, size),
    queryFn: async () => getBookPageData(
      await bookService.getPublicBooks({ page, size, sort: 'buyCount,desc' }),
      'Không thể tải sách nổi bật',
    ),
    staleTime: 1000 * 60 * 5,
  });
};
