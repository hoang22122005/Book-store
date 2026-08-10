import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type {
  BookResponse,
  BookListQuery,
  BookAddRequest,
  BookUpdateRequest,
  BookEntityResponse,
} from '../../../types/api/book';

export type AdminBookResponse = BookEntityResponse;

export const adminBookService = {
  getAdminBooks: (params: BookListQuery = {}) =>
    apiClient.get<ApiResponse<PageResponse<BookResponse>>>('/api/public/books', {
      params: {
        keyword: params.keyword,
        author: params.author,
        categoryId: params.categoryId,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        inStock: params.inStock,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'bookId,desc',
      },
    }),

  getAdminBookDetail: (bookId: number) =>
    apiClient.get<ApiResponse<BookResponse>>(`/api/public/books/${bookId}`),

  addBook: (formData: FormData) =>
    apiClient.post<ApiResponse<BookResponse>>('/api/admin/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateBook: (bookId: number, formData: FormData) =>
    apiClient.put<ApiResponse<BookResponse>>(`/api/admin/books/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteBook: (bookId: number) =>
    apiClient.delete<ApiResponse<void>>(`/api/admin/books/${bookId}`),
};
