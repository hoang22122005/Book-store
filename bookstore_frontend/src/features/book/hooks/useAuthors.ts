import { useQuery } from '@tanstack/react-query';
import { bookService } from '../services/bookService';

export const bookQueryKeys = {
  authors: ['book', 'authors'] as const,
};

export const useAuthors = () => {
  return useQuery({
    queryKey: bookQueryKeys.authors,
    queryFn: bookService.getAuthors,
    staleTime: 5 * 60 * 1000,
  });
};
