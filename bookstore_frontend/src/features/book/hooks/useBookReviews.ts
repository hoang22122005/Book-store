import { useQuery } from '@tanstack/react-query';
import { commentService } from '../../catalog/services/commentService';
import type { CommentResponse, RatingResponse } from '../../../types/api/review';
import type { PageResponse } from '../../../types/api/common';

export const reviewQueryKeys = {
  all: ['reviews'] as const,
  byBook: (bookId: number) => [...reviewQueryKeys.all, 'book', bookId] as const,
  comments: (bookId: number) => [...reviewQueryKeys.byBook(bookId), 'comments'] as const,
  ratings: (bookId: number) => [...reviewQueryKeys.byBook(bookId), 'ratings'] as const,
};

export const useBookComments = (bookId: number, page = 0, size = 5) => {
  return useQuery<PageResponse<CommentResponse>, Error>({
    queryKey: reviewQueryKeys.comments(bookId),
    queryFn: () => commentService.getPublicComments({ page, size, bookId }),
    staleTime: 1000 * 60 * 5,
    enabled: bookId > 0,
  });
};

export const useBookRatings = (bookId: number, page = 0, size = 10) => {
  return useQuery<PageResponse<RatingResponse>, Error>({
    queryKey: reviewQueryKeys.ratings(bookId),
    queryFn: () => commentService.getPublicRatings({ page, size, bookId }),
    staleTime: 1000 * 60 * 5,
    enabled: bookId > 0,
  });
};
