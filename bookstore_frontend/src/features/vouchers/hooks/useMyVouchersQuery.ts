import { useQuery } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';
import { useAuth } from '../../../hooks/useAuth';

export const MY_VOUCHERS_QUERY_KEY = ['myVouchers'];

export const useMyVouchersQuery = (page = 0, size = 20) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...MY_VOUCHERS_QUERY_KEY, page, size],
    queryFn: async () => {
      const response = await voucherService.getMyVouchers(page, size);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách voucher');
      }
      return response.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
