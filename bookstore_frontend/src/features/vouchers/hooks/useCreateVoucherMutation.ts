import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateVoucherRequest, VoucherResponse } from '../../../types/api/voucher';
import { voucherService } from '../services/voucherService';
import { adminVoucherQueryKeys } from './useAdminVoucherQueries';

export const useCreateVoucherMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<VoucherResponse, Error, CreateVoucherRequest>({
    mutationFn: async (request) => {
      const response = await voucherService.createVoucher(request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tạo voucher');
      }
      return response.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminVoucherQueryKeys.all }),
  });
};
