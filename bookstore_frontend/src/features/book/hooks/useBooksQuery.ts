import { useQuery } from '@tanstack/react-query';
import { bookService, type GetBooksQueryParams, type Book, type PageResponseDTO } from '../services/bookService';

export const bookQueryKeys = {
  all: ['books'] as const,
  lists: () => [...bookQueryKeys.all, 'list'] as const,
  list: (params: GetBooksQueryParams) => [...bookQueryKeys.lists(), params] as const,
  bestsellers: (page: number, size: number) => [...bookQueryKeys.all, 'bestsellers', page, size] as const,
  newArrivals: (page: number, size: number) => [...bookQueryKeys.all, 'newArrivals', page, size] as const,
  hot: (page: number, size: number) => [...bookQueryKeys.all, 'hot', page, size] as const,
  details: () => [...bookQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...bookQueryKeys.details(), id] as const,
};

export const useBooksQuery = (params: GetBooksQueryParams = {}) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: bookQueryKeys.list(params),
    queryFn: () => bookService.getPublicBooks(params),
    staleTime: 1000 * 60 * 5,
  });
};
