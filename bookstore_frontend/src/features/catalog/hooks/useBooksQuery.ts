import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getBookPageData, type GetBooksQueryParams, type Book, type PageResponseDTO } from './bookQueryData';

export const catalogQueryKeys = {
  all: ['books'] as const,
  lists: () => [...catalogQueryKeys.all, 'list'] as const,
  list: (params: GetBooksQueryParams) => [...catalogQueryKeys.lists(), params] as const,
  bestsellers: (page: number, size: number) => [...catalogQueryKeys.all, 'bestsellers', page, size] as const,
  newArrivals: (page: number, size: number) => [...catalogQueryKeys.all, 'newArrivals', page, size] as const,
  hot: (page: number, size: number) => [...catalogQueryKeys.all, 'hot', page, size] as const,
  genres: () => [...catalogQueryKeys.all, 'genres'] as const,
  details: () => [...catalogQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...catalogQueryKeys.details(), id] as const,
  recommendations: (page: number, size: number) => [...catalogQueryKeys.all, 'recommendations', page, size] as const,
  similar: (bookId: number, page: number, size: number) => [...catalogQueryKeys.all, 'similar', bookId, page, size] as const,
};

export const useBooksQuery = (params: GetBooksQueryParams = {}) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: catalogQueryKeys.list(params),
    queryFn: async () => getBookPageData(await bookService.getPublicBooks(params), 'Phản hồi danh sách sách không hợp lệ'),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
