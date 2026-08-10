import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { CommentRequest, CommentResponse, RatingRequest, RatingResponse } from '../../../types/api/review';

export const commentService = {
  getPublicComments: (params: { page?: number; size?: number; bookId?: number } = {}) =>
    apiClient.get<ApiResponse<PageResponse<CommentResponse>>>('/api/public/comments', {
      params: { page: params.page ?? 0, size: params.size ?? 10, bookId: params.bookId },
    }),

  getPublicRatings: (params: { page?: number; size?: number; bookId?: number } = {}) =>
    apiClient.get<ApiResponse<PageResponse<RatingResponse>>>('/api/public/ratings', {
      params: { page: params.page ?? 0, size: params.size ?? 10, bookId: params.bookId },
    }),

  createComment: (request: CommentRequest) =>
    apiClient.post<ApiResponse<CommentResponse>>('/api/comments', request),

  createRating: (request: RatingRequest) =>
    apiClient.post<ApiResponse<RatingResponse>>('/api/ratings', request),

  updateRating: (ratingId: number, request: RatingRequest) =>
    apiClient.put<ApiResponse<RatingResponse>>(`/api/ratings/${ratingId}`, request),
};
