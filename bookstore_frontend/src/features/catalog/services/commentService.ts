import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { CommentResponse, RatingResponse } from '../../../types/api/review';

export const commentService = {
  getPublicComments: async (params: { page?: number; size?: number; bookId?: number } = {}): Promise<PageResponse<CommentResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<CommentResponse>>>('/api/public/comments', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        bookId: params.bookId,
      },
    });
    if (!response.data.data) {
      throw new Error('Phản hồi bình luận không hợp lệ');
    }
    return response.data.data;
  },

  getPublicRatings: async (params: { page?: number; size?: number; bookId?: number } = {}): Promise<PageResponse<RatingResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<RatingResponse>>>('/api/public/ratings', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        bookId: params.bookId,
      },
    });
    if (!response.data.data) {
      throw new Error('Phản hồi đánh giá không hợp lệ');
    }
    return response.data.data;
  },
};
