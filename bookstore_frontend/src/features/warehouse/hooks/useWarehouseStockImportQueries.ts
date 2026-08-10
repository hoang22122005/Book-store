import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../../../types/api/common';
import type { StockImportResponse } from '../../../types/api/stockImport';
import { warehouseStockImportService } from '../services/warehouseStockImportService';

export const stockImportQueryKeys = {
  all: ['stockImports'] as const,
  lists: () => [...stockImportQueryKeys.all, 'list'] as const,
  list: () => [...stockImportQueryKeys.lists()] as const,
  detail: (importId: number) => [...stockImportQueryKeys.all, 'detail', importId] as const,
};

const getApiData = <T>(response: AxiosResponse<ApiResponse<T>>, fallbackMessage: string): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const useStockImportList = () => {
  return useQuery<StockImportResponse[], Error>({
    queryKey: stockImportQueryKeys.list(),
    queryFn: async () => {
      const response = await warehouseStockImportService.getAll();
      return getApiData(response, 'Không thể tải danh sách phiếu nhập');
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useStockImportDetail = (importId: number) => {
  return useQuery<StockImportResponse, Error>({
    queryKey: stockImportQueryKeys.detail(importId),
    queryFn: async () => {
      const response = await warehouseStockImportService.getById(importId);
      return getApiData(response, 'Không tìm thấy phiếu nhập');
    },
    enabled: importId > 0,
    staleTime: 1000 * 60 * 2,
  });
};
