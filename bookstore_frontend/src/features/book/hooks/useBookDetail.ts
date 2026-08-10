import { useQuery } from '@tanstack/react-query';
import { bookService, type Book } from '../services/bookService';
import { bookQueryKeys } from './useBooksQuery';

export const useBookDetail = (bookId: number) => {
  return useQuery<Book, Error>({
    queryKey: bookQueryKeys.detail(bookId),
    queryFn: () => bookService.getBookDetail(bookId),
    staleTime: 1000 * 60 * 5,
    enabled: bookId > 0,
  });
};
