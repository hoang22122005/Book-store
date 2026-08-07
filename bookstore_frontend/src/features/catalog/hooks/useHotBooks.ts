import { useQuery } from '@tanstack/react-query';
import { bookService, type Book, type PageResponseDTO } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useHotBooks = (page = 0, size = 3) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.hot(page, size),
    queryFn: () =>
      bookService.getPublicBooks({
        page,
        size,
        sort: 'buyCount,desc',
      }),
    staleTime: 1000 * 60 * 5,
  });
};
