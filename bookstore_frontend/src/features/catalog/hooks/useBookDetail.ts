import { useQuery } from '@tanstack/react-query';
import { bookService, type Book } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useBookDetail = (bookId: number) => {
  return useQuery<Book, Error>({
    queryKey: catalogQueryKeys.detail(bookId),
    queryFn: () => bookService.getBookDetail(bookId),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
};
