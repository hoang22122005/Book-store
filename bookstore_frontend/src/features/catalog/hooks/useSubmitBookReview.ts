import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { catalogQueryKeys } from './useBooksQuery';
import { getApiData } from './bookQueryData';

interface SubmitBookReviewInput {
  bookId: number;
  content: string;
  ratingValue: number;
  existingRatingId?: number;
}

export const useSubmitBookReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, content, ratingValue, existingRatingId }: SubmitBookReviewInput) => {
      const ratingRequest = { bookId, ratingValue };
      if (existingRatingId) {
        getApiData(await commentService.updateRating(existingRatingId, ratingRequest), 'Không thể cập nhật đánh giá');
      } else {
        getApiData(await commentService.createRating(ratingRequest), 'Không thể lưu đánh giá');
      }
      return getApiData(
        await commentService.createComment({ bookId, content: content.trim() }),
        'Không thể lưu bình luận',
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public', 'comments', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['public', 'ratings', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.lists() });
    },
  });
};
