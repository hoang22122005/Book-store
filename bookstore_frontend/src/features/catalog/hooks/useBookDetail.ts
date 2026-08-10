import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getApiData, transformBookResponse, type Book } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useBookDetail = (bookId: number) => {
  return useQuery<Book, Error>({
    queryKey: catalogQueryKeys.detail(bookId),
    queryFn: async () => transformBookResponse(getApiData(await bookService.getBookDetail(bookId), 'Không tìm thấy dữ liệu sách')),
    enabled: !!bookId,
    staleTime: 1000 * 60 * 5,
  });
};
