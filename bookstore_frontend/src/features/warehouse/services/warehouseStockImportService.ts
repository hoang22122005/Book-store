import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api/common';
import type {
  StockImportResponse,
  CreateStockImportRequest,
  AddStockImportDetailRequest,
} from '../../../types/api/stockImport';

export const warehouseStockImportService = {
  getAll: () =>
    apiClient.get<ApiResponse<StockImportResponse[]>>('/api/stock-imports'),

  getById: (importId: number) =>
    apiClient.get<ApiResponse<StockImportResponse>>(`/api/stock-imports/${importId}`),

  createDraft: (req: CreateStockImportRequest) =>
    apiClient.post<ApiResponse<StockImportResponse>>('/api/stock-imports', req),

  addDetail: (importId: number, req: AddStockImportDetailRequest) =>
    apiClient.post<ApiResponse<StockImportResponse>>(`/api/stock-imports/${importId}/details`, req),

  postImport: (importId: number) =>
    apiClient.post<ApiResponse<StockImportResponse>>(`/api/stock-imports/${importId}/post`),

  cancelImport: (importId: number) =>
    apiClient.post<ApiResponse<StockImportResponse>>(`/api/stock-imports/${importId}/cancel`),
};
