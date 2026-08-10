import type { AxiosResponse } from 'axios';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BookListQuery, BookResponse, GenreResponse } from '../../../types/api/book';

export type GetBooksQueryParams = BookListQuery;
export type PageResponseDTO<T> = PageResponse<T>;
export type BookResponseDTO = BookResponse;

export type GenreItem = GenreResponse;

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  activeCampaignName?: string;
  badgeText?: string;
  badgeType?: 'discount' | 'new';
  coverUrl?: string;
  buyCount: number;
  avgRating: number;
  cntRating: number;
  description?: string;
  quantityInStock: number;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  pageCount?: number;
  isVip?: boolean;
  genres?: string[];
}

export const getApiData = <T>(response: AxiosResponse<ApiResponse<T>>, fallbackMessage: string): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const resolveBookCoverUrl = (url?: string | null): string | undefined => {
  const normalized = url?.trim();
  if (!normalized) return undefined;
  if (normalized.startsWith('//')) return `https:${normalized}`;
  return normalized.replace(/^http:\/\//i, 'https://');
};

export const transformBookResponse = (dto: BookResponse): Book => {
  const originalPrice = Number(dto.price) || 0;
  const salePrice = Number(dto.salePrice);
  const discountPercent = Number(dto.discountPercent);
  const hasActiveDiscount = Number.isFinite(salePrice)
    && Number.isFinite(discountPercent)
    && discountPercent > 0
    && salePrice >= 0
    && salePrice < originalPrice;

  return {
    id: dto.bookId,
    title: dto.name,
    author: dto.author || 'Tác giả',
    price: hasActiveDiscount ? salePrice : originalPrice,
    originalPrice: hasActiveDiscount ? originalPrice : undefined,
    discountPercent: hasActiveDiscount ? discountPercent : undefined,
    activeCampaignName: hasActiveDiscount ? dto.activeCampaignName ?? undefined : undefined,
    coverUrl: resolveBookCoverUrl(dto.urlImg),
    buyCount: dto.buyCount || 0,
    avgRating: dto.avgRating || 0,
    cntRating: dto.cntRating || 0,
    description: dto.description ?? undefined,
    quantityInStock: dto.quantityInStock || 0,
    publisher: dto.publisher ?? undefined,
    publishYear: dto.publishYear ?? undefined,
    isbn: dto.isbn ?? undefined,
    pageCount: dto.pageCount ?? undefined,
    isVip: dto.isVip ?? false,
    genres: dto.genres || [],
  };
};

export const getBookPageData = (
  response: AxiosResponse<ApiResponse<PageResponse<BookResponse>>>,
  fallbackMessage: string,
): PageResponse<Book> => {
  const page = getApiData(response, fallbackMessage);
  return { ...page, content: (page.content || []).map(transformBookResponse) };
};
