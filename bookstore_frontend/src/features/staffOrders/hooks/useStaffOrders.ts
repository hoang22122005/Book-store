import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BillResponse } from '../../../types/api/bill';
import type { PageResponse } from '../../../types/api/common';
import { staffOrderService } from '../services/staffOrderService';

export const staffOrderQueryKeys = {
  all: ['staff-orders'] as const,
  lists: () => [...staffOrderQueryKeys.all, 'list'] as const,
  list: (page: number, size: number) =>
    [...staffOrderQueryKeys.lists(), { page, size }] as const,
  directLists: () => [...staffOrderQueryKeys.all, 'direct'] as const,
  directList: (page: number, size: number) =>
    [...staffOrderQueryKeys.directLists(), { page, size }] as const,
};

const requireData = <T>(
  response: { data: { success: boolean; message?: string; data?: T } },
  fallbackMessage: string,
): T => {
  if (!response.data.success || response.data.data === undefined || response.data.data === null) {
    throw new Error(response.data.message || fallbackMessage);
  }
  return response.data.data;
};

export const useAllStaffOrders = (page: number, size = 10) =>
  useQuery<PageResponse<BillResponse>, Error>({
    queryKey: staffOrderQueryKeys.list(page, size),
    queryFn: async () => {
      const response = await staffOrderService.getAllOrders(page, size);
      return requireData(response, 'Không thể tải danh sách đơn hàng');
    },
    staleTime: 30_000,
  });

export const useDirectStaffOrders = (page: number, size = 10) =>
  useQuery<PageResponse<BillResponse>, Error>({
    queryKey: staffOrderQueryKeys.directList(page, size),
    queryFn: async () => {
      const response = await staffOrderService.getDirectOrders(page, size);
      return requireData(response, 'Không thể tải danh sách đơn thanh toán trực tiếp');
    },
    staleTime: 30_000,
  });

export interface AdvanceDirectOrderVariables {
  billId: number;
  status: 'CONFIRMED' | 'SHIPPING' | 'COMPLETED';
}

export const useAdvanceDirectOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<BillResponse, Error, AdvanceDirectOrderVariables>({
    mutationFn: async ({ billId, status }) => {
      const response = await staffOrderService.updateStatus(billId, { status });
      return requireData(response, 'Không thể cập nhật trạng thái đơn hàng');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffOrderQueryKeys.all });
    },
  });
};
