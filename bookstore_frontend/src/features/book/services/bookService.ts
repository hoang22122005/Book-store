import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BookResponse, BookListQuery } from '../../../types/api/book';

export type BookResponseDTO = BookResponse;
export type PageResponseDTO<T> = PageResponse<T>;
export type ApiResponseDTO<T> = ApiResponse<T>;
export type GetBooksQueryParams = BookListQuery;

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
  const hasDiscount = dto.discountPercent && dto.discountPercent > 0;
  return {
    id: dto.bookId,
    title: dto.name,
    author: dto.author || 'Tác giả',
    price: dto.salePrice || dto.price || 0,
    originalPrice: hasDiscount ? dto.price : undefined,
    discountPercent: hasDiscount ? Number(dto.discountPercent) : undefined,
    coverUrl: dto.urlImg || '',
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
        inStock: params.inStock,
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

  getBestsellerBooks: async (page = 0, size = 4): Promise<PageResponseDTO<Book>> => {
    return bookService.getPublicBooks({ page, size, sort: 'buyCount,desc' });
  },

  getNewArrivalBooks: async (page = 0, size = 4): Promise<PageResponseDTO<Book>> => {
    return bookService.getPublicBooks({ page, size, sort: 'createdAt,desc' });
  },

  getHotBooks: async (page = 0, size = 3): Promise<PageResponseDTO<Book>> => {
    return bookService.getPublicBooks({ page, size, sort: 'avgRating,desc' });
  },
};
