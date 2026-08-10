import { useQuery } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import type { CommentResponse } from '../../../types/api/review';
import type { PageResponse } from '../../../types/api/common';
import { getApiData } from './bookQueryData';

export const useCustomerReviews = (size = 3) => {
  return useQuery<PageResponse<CommentResponse>, Error>({
    queryKey: ['public', 'comments', size],
    queryFn: async () => getApiData(await commentService.getPublicComments({ page: 0, size }), 'Phản hồi bình luận không hợp lệ'),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBookComments = (bookId: number, size = 5) => {
  return useQuery<PageResponse<CommentResponse>, Error>({
    queryKey: ['public', 'comments', 'book', bookId, size],
    queryFn: async () => getApiData(await commentService.getPublicComments({ page: 0, size, bookId }), 'Phản hồi bình luận không hợp lệ'),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60 * 5,
  });
};

export const useBookRatings = (bookId: number, size = 50) => {
  return useQuery({
    queryKey: ['public', 'ratings', 'book', bookId, size],
    queryFn: async () => getApiData(await commentService.getPublicRatings({ page: 0, size, bookId }), 'Phản hồi đánh giá không hợp lệ'),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60 * 5,
  });
};
