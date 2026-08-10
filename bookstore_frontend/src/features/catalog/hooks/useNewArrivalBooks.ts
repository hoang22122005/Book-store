import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getBookPageData, type Book, type PageResponseDTO } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useNewArrivalBooks = (page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.newArrivals(page, size),
    queryFn: async () => getBookPageData(
      await bookService.getPublicBooks({ page, size, sort: 'createdAt,desc' }),
      'Không thể tải sách mới',
    ),
    staleTime: 1000 * 60 * 5,
  });
};
