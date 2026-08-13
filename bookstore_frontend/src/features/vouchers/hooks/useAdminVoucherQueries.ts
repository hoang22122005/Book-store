import { useQuery } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import type { PageResponse } from '../../../types/api/common';
import type { VoucherResponse } from '../../../types/api/voucher';

export const adminVoucherQueryKeys = {
  all: ['admin-vouchers'] as const,
  list: (page: number, size: number) => [...adminVoucherQueryKeys.all, page, size] as const,
};

export const useAdminVouchersQuery = (page: number, size: number) =>
  useQuery<PageResponse<VoucherResponse>, Error>({
    queryKey: adminVoucherQueryKeys.list(page, size),
    queryFn: async () => {
      const response = await voucherService.getAdminVouchers(page, size);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách voucher');
      }
      return response.data.data;
    },
  });
