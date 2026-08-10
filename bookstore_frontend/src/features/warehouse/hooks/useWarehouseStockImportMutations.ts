import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseStockImportService } from '../services/warehouseStockImportService';
import { stockImportQueryKeys } from './useWarehouseStockImportQueries';
import type { CreateStockImportRequest, AddStockImportDetailRequest } from '../../../types/api/stockImport';

const getApiData = <T>(response: { data: { success: boolean; message?: string; data?: T } }, fallbackMessage: string): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const useCreateDraftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateStockImportRequest) => {
      const response = await warehouseStockImportService.createDraft(req);
      return getApiData(response, 'Không thể tạo phiếu nhập');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockImportQueryKeys.all });
    },
  });
};

export const useAddDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ importId, req }: { importId: number; req: AddStockImportDetailRequest }) => {
      const response = await warehouseStockImportService.addDetail(importId, req);
      return getApiData(response, 'Không thể thêm sách vào phiếu nhập');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stockImportQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: stockImportQueryKeys.detail(variables.importId) });
    },
  });
};

export const usePostImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: number) => {
      const response = await warehouseStockImportService.postImport(importId);
      return getApiData(response, 'Không thể xác nhận nhập kho');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockImportQueryKeys.all });
    },
  });
};

export const useCancelImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importId: number) => {
      const response = await warehouseStockImportService.cancelImport(importId);
      return getApiData(response, 'Không thể hủy phiếu nhập');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockImportQueryKeys.all });
    },
  });
};
