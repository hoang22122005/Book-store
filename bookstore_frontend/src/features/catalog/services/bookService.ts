import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BookListQuery, BookResponse, GenreResponse, RecommendationQuery } from '../../../types/api/book';

export const bookService = {
  getPublicBooks: (params: BookListQuery = {}) =>
    apiClient.get<ApiResponse<PageResponse<BookResponse>>>('/api/public/books', {
      params: {
        keyword: params.keyword,
        author: params.author,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        page: params.page ?? 0,
        size: params.size ?? 12,
        sort: params.sort,
      },
    }),

  getBookDetail: (bookId: number) =>
    apiClient.get<ApiResponse<BookResponse>>(`/api/public/books/${bookId}`),

  getGenres: () =>
    apiClient.get<ApiResponse<GenreResponse[]>>('/api/public/genres'),

  getUserRecommendations: (params: RecommendationQuery = {}) =>
    apiClient.get<ApiResponse<PageResponse<BookResponse>>>('/api/recommendations/user', {
      params: { page: params.page ?? 0, size: params.size ?? 10, topK: params.topK ?? 100 },
    }),

  getSimilarRecommendations: (bookId: number, params: RecommendationQuery = {}) =>
    apiClient.get<ApiResponse<PageResponse<BookResponse>>>(`/api/public/recommendations/similar/${bookId}`, {
      params: { page: params.page ?? 0, size: params.size ?? 10, topK: params.topK ?? 100 },
    }),

  addAdminBook: (formData: FormData) =>
    apiClient.post<ApiResponse<BookResponse>>('/api/admin/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateAdminBook: (bookId: number, formData: FormData) =>
    apiClient.put<ApiResponse<BookResponse>>(`/api/admin/books/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteAdminBook: (bookId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/admin/books/${bookId}`),
};
