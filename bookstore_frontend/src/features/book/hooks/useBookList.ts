import { useQuery } from '@tanstack/react-query';
import { bookService, type Book, type PageResponseDTO } from '../services/bookService';
import { bookQueryKeys } from './useBooksQuery';

export const useBookList = (page = 0, size = 12, sort?: string) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: bookQueryKeys.list({ page, size, sort }),
    queryFn: () => bookService.getPublicBooks({ page, size, sort }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBestsellerBooks = (page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: bookQueryKeys.bestsellers(page, size),
    queryFn: () => bookService.getBestsellerBooks(page, size),
    staleTime: 1000 * 60 * 5,
  });
};

export const useNewArrivalBooks = (page = 0, size = 4) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: bookQueryKeys.newArrivals(page, size),
    queryFn: () => bookService.getNewArrivalBooks(page, size),
    staleTime: 1000 * 60 * 5,
  });
};

export const useHotBooks = (page = 0, size = 3) => {
  return useQuery<PageResponseDTO<Book>, Error>({
    queryKey: bookQueryKeys.hot(page, size),
    queryFn: () => bookService.getHotBooks(page, size),
    staleTime: 1000 * 60 * 5,
  });
};
