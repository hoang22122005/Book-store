import { useQuery } from '@tanstack/react-query';
import { bookService, type Book, type PageResponseDTO } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useNewArrivalBooks = (page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.newArrivals(page, size),
    queryFn: () => bookService.getPublicBooks({ page, size, sort: 'createdAt,desc' }),
    staleTime: 1000 * 60 * 5,
  });
};
