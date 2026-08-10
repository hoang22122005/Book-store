import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { BillResponse } from '../../../types/api/bill';

export const orderService = {
  getMyBills: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<BillResponse>>>('/api/bills/me', {
      params: { page, size, sort: 'billId,desc' },
    }),

  getMyBillById: (billId: number) =>
    apiClient.get<ApiResponse<BillResponse>>(`/api/bills/me/${billId}`),
};
