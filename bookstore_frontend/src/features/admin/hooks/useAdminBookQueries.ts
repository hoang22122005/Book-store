import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BookResponse, BookListQuery } from '../../../types/api/book';
import { adminBookService, type AdminBookResponse } from '../services/adminBookService';

export const adminBookQueryKeys = {
  all: ['adminBooks'] as const,
  lists: () => [...adminBookQueryKeys.all, 'list'] as const,
  list: (params: BookListQuery) => [...adminBookQueryKeys.lists(), params] as const,
  detail: (bookId: number) => [...adminBookQueryKeys.all, 'detail', bookId] as const,
};

const getApiData = <T>(response: AxiosResponse<ApiResponse<T>>, fallbackMessage: string): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const useAdminBookList = (params: BookListQuery = {}) => {
  return useQuery<PageResponse<BookResponse>, Error>({
    queryKey: adminBookQueryKeys.list(params),
    queryFn: async () => {
      const response = await adminBookService.getAdminBooks(params);
      return getApiData(response, 'Không thể tải danh sách sách');
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminBookDetail = (bookId: number) => {
  return useQuery<BookResponse, Error>({
    queryKey: adminBookQueryKeys.detail(bookId),
    queryFn: async () => {
      const response = await adminBookService.getAdminBookDetail(bookId);
      return getApiData(response, 'Không tìm thấy sách');
    },
    enabled: bookId > 0,
    staleTime: 1000 * 60 * 2,
  });
};
