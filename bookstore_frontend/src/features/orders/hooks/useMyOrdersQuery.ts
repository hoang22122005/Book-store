import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export const useMyOrdersQuery = (page = 0, size = 20) => {
  return useQuery({
    queryKey: ['myOrders', page, size],
    queryFn: async () => {
      const response = await orderService.getMyBills(page, size);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách đơn hàng');
      }
      return response.data.data;
    },
  });
};

export const useMyOrderDetailQuery = (billId: number | null) => {
  return useQuery({
    queryKey: ['myOrderDetail', billId],
    queryFn: async () => {
      const response = await orderService.getMyBillById(billId!);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không tìm thấy thông tin đơn hàng');
      }
      return response.data.data;
    },
    enabled: !!billId,
  });
};
