import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type { VoucherResponse } from '../../../types/api/voucher';

export const voucherService = {
  getMyVouchers: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<VoucherResponse>>>('/api/vouchers/me', {
      params: { page, size, sort: 'voucherId,desc' },
    }),
};
