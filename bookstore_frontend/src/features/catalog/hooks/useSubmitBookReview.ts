import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { catalogQueryKeys } from './useBooksQuery';
import { getApiData } from './bookQueryData';

export const useCheckBookPurchased = (bookId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['books', 'purchased', bookId],
    queryFn: async () => {
      try {
        const response = await commentService.checkBookPurchased(bookId);
        return response.data.data ?? false;
      } catch {
        return false;
      }
    },
    enabled: enabled && Boolean(bookId),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSubmitRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, ratingValue }: { bookId: number; ratingValue: number }) => {
      return getApiData(
        await commentService.createRating({ bookId, ratingValue }),
        'Không thể lưu đánh giá',
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public', 'ratings', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.lists() });
    },
  });
};

export const useSubmitComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, content }: { bookId: number; content: string }) => {
      return getApiData(
        await commentService.createComment({ bookId, content: content.trim() }),
        'Không thể lưu bình luận',
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public', 'comments', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
    },
  });
};

interface SubmitBookReviewInput {
  bookId: number;
  content: string;
  ratingValue: number;
}

export const useSubmitBookReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, content, ratingValue }: SubmitBookReviewInput) => {
      if (ratingValue > 0) {
        getApiData(await commentService.createRating({ bookId, ratingValue }), 'Không thể lưu đánh giá');
      }
      if (content && content.trim().length > 0) {
        getApiData(
          await commentService.createComment({ bookId, content: content.trim() }),
          'Không thể lưu bình luận',
        );
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public', 'comments', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: ['public', 'ratings', 'book', variables.bookId] });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.detail(variables.bookId) });
      queryClient.invalidateQueries({ queryKey: catalogQueryKeys.lists() });
    },
  });
};
