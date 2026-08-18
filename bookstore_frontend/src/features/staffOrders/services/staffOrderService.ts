import { apiClient } from '../../../lib/apiClient';
import type { BillResponse, UpdateBillStatusRequest } from '../../../types/api/bill';
import type { ApiResponse, PageResponse } from '../../../types/api/common';

export const staffOrderService = {
  getAllOrders: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<BillResponse>>>('/api/dashboard/staff/orders', {
      params: { page, size, sort: 'billId,desc' },
    }),

  getDirectOrders: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<BillResponse>>>('/api/dashboard/staff/orders/direct', {
      params: { page, size, sort: 'billId,desc' },
    }),

  updateStatus: (billId: number, request: UpdateBillStatusRequest) =>
    apiClient.patch<ApiResponse<BillResponse>>(
      `/api/dashboard/staff/orders/${billId}/status`,
      request,
    ),
};
