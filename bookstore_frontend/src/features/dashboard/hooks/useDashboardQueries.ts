import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { dashboardQueryKeys } from './dashboardQueryKeys';
import { tokenStorage } from '../../../utils';

export function useOrderSummary(enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.summaries(),
    queryFn: async () => {
      const response = await dashboardService.getSummary();
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải tổng quan đơn hàng');
      }
      return response.data.data;
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFinancialOverview(from: string, to: string, enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.financialOverview({ from, to }),
    queryFn: async () => {
      const response = await dashboardService.getFinancialOverview(from, to);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải tổng quan tài chính');
      }
      return response.data.data;
    },
    enabled: enabled && !!token && !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueChart(from: string, to: string, enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.revenue({ from, to }),
    queryFn: async () => {
      const response = await dashboardService.getRevenueByDay(from, to);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải biểu đồ doanh thu');
      }
      return response.data.data;
    },
    enabled: enabled && !!token && !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopBooks(limit: number = 5, enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.topBook({ limit }),
    queryFn: async () => {
      const response = await dashboardService.getTopBooks(limit);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải sách bán chạy');
      }
      return response.data.data;
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopCustomers(from: string, to: string, limit: number = 10, enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.topCustomers({ from, to, limit }),
    queryFn: async () => {
      const response = await dashboardService.getTopCustomers(from, to, limit);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách khách hàng');
      }
      return response.data.data;
    },
    enabled: enabled && !!token && !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethodStats(from: string, to: string, enabled = true) {
  const token = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: dashboardQueryKeys.paymentMethodsStat({ from, to }),
    queryFn: async () => {
      const response = await dashboardService.getPaymentMethodStats(from, to);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải thống kê thanh toán');
      }
      return response.data.data;
    },
    enabled: enabled && !!token && !!from && !!to,
    staleTime: 5 * 60 * 1000,
  });
}
