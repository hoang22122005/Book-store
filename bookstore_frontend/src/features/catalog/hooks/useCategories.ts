import { useQuery } from '@tanstack/react-query';
import { bookService, type GenreItem } from '../services/bookService';
import { catalogQueryKeys } from './useBooksQuery';

export const useCategories = () => {
  return useQuery<GenreItem[], Error>({
    queryKey: catalogQueryKeys.genres(),
    queryFn: () => bookService.getGenres(),
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });
};
