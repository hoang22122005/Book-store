import { useQuery } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import type { CommentResponse } from '../../../types/api/review';
import type { PageResponse } from '../../../types/api/common';

export const useCustomerReviews = (size = 3) => {
  return useQuery<PageResponse<CommentResponse>, Error>({
    queryKey: ['public', 'comments', size],
    queryFn: () => commentService.getPublicComments({ page: 0, size }),
    staleTime: 1000 * 60 * 5,
  });
};
