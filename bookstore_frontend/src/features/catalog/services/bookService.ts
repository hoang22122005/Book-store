import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BookResponse, BookListQuery, RecommendationQuery } from '../../../types/api/book';

/* -------------------------------------------------------------------------- */
/* DTO & Interface Definitions                                                */
/* -------------------------------------------------------------------------- */

export type BookResponseDTO = BookResponse;
export type PageResponseDTO<T> = PageResponse<T>;
export type ApiResponseDTO<T> = ApiResponse<T>;
export type GetBooksQueryParams = BookListQuery;
export type RecommendationQueryParams = RecommendationQuery;

export interface GenreItem {
  genreId: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badgeText?: string;
  badgeType?: 'discount' | 'new';
  coverUrl: string;
  buyCount: number;
  avgRating: number;
  cntRating: number;
  description?: string;
  quantityInStock: number;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  genres?: string[];
}

export const transformBookResponse = (dto: BookResponseDTO): Book => {
  return {
    id: dto.bookId,
    title: dto.name,
    author: dto.author || 'Tác giả',
    price: dto.price || 0,
    originalPrice: dto.price ? Math.round(dto.price * 1.15) : undefined,
    coverUrl: dto.urlImg || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    buyCount: dto.buyCount || 0,
    avgRating: dto.avgRating || 0,
    cntRating: dto.cntRating || 0,
    description: dto.description ?? undefined,
    quantityInStock: dto.quantityInStock || 0,
    publisher: dto.publisher ?? undefined,
    publishYear: dto.publishYear ?? undefined,
    isbn: dto.isbn ?? undefined,
    genres: dto.genres || [],
  };
};

export const bookService = {

  getPublicBooks: async (params: GetBooksQueryParams = {}): Promise<PageResponseDTO<Book>> => {
    const response = await apiClient.get<ApiResponseDTO<PageResponseDTO<BookResponseDTO>>>('/api/public/books', {
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
    });

    const pageData = response.data.data;
    if (!pageData) {
      throw new Error('Phản hồi danh sách sách không hợp lệ');
    }
    return {
      ...pageData,
      content: (pageData.content || []).map(transformBookResponse),
    };
  },

  getBookDetail: async (bookId: number): Promise<Book> => {
    const response = await apiClient.get<ApiResponseDTO<BookResponseDTO>>(`/api/public/books/${bookId}`);
    if (!response.data.data) {
      throw new Error('Không tìm thấy dữ liệu sách');
    }
    return transformBookResponse(response.data.data);
  },

  getGenres: async (): Promise<GenreItem[]> => {
    const response = await apiClient.get<ApiResponseDTO<GenreItem[]>>('/api/public/genres');
    return response.data.data || [];
  },

  getUserRecommendations: async (params: RecommendationQueryParams = {}): Promise<PageResponseDTO<Book>> => {
    const response = await apiClient.get<ApiResponseDTO<PageResponseDTO<BookResponseDTO>>>('/api/recommendations/user', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        topK: params.topK ?? 100,
      },
    });

    const pageData = response.data.data;
    if (!pageData) {
      throw new Error('Phản hồi gợi ý sách không hợp lệ');
    }
    return {
      ...pageData,
      content: (pageData.content || []).map(transformBookResponse),
    };
  },

  getSimilarRecommendations: async (
    bookId: number,
    params: RecommendationQueryParams = {}
  ): Promise<PageResponseDTO<Book>> => {
    const response = await apiClient.get<ApiResponseDTO<PageResponseDTO<BookResponseDTO>>>(
      `/api/public/recommendations/similar/${bookId}`,
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 10,
          topK: params.topK ?? 100,
        },
      }
    );

    const pageData = response.data.data;
    if (!pageData) {
      throw new Error('Phản hồi sách tương tự không hợp lệ');
    }
    return {
      ...pageData,
      content: (pageData.content || []).map(transformBookResponse),
    };
  },

  addAdminBook: async (formData: FormData): Promise<BookResponseDTO> => {
    const response = await apiClient.post<ApiResponseDTO<BookResponseDTO>>('/api/admin/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.data) {
      throw new Error('Không thể tạo sách');
    }
    return response.data.data;
  },

  updateAdminBook: async (bookId: number, formData: FormData): Promise<BookResponseDTO> => {
    const response = await apiClient.put<ApiResponseDTO<BookResponseDTO>>(`/api/admin/books/${bookId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!response.data.data) {
      throw new Error('Không thể cập nhật sách');
    }
    return response.data.data;
  },

  deleteAdminBook: async (bookId: number): Promise<void> => {
    await apiClient.delete<ApiResponseDTO<void>>(`/api/admin/books/${bookId}`);
  },
};
