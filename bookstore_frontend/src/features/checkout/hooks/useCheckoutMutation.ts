import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkoutService } from '../services/checkoutService';
import type { CreateBillRequest } from '../../../types/api/bill';
import { CART_QUERY_KEY } from '../../cart/hooks/useCartQueries';

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateBillRequest) => {
      try {
        const response = await checkoutService.createBillFromCart(request);
        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || 'Thanh toán đơn hàng thất bại');
        }
        return response.data.data;
      } catch (error: unknown) {
        const apiError = error as { response?: { data?: { message?: string } }; message?: string };
        throw new Error(apiError.response?.data?.message || apiError.message || 'Có lỗi xảy ra khi tạo đơn hàng', { cause: error });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
