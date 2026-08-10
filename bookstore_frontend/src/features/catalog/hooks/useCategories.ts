import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';
import { getApiData, type GenreItem } from './bookQueryData';
import { catalogQueryKeys } from './useBooksQuery';

export const useCategories = () => {
  return useQuery<GenreItem[], Error>({
    queryKey: catalogQueryKeys.genres(),
    queryFn: async () => getApiData(await bookService.getGenres(), 'Không thể tải thể loại sách'),
    staleTime: 1000 * 60 * 15, // 15 mins cache
  });
};
