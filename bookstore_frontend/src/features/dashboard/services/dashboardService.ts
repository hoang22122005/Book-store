import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api';
import type {
  OrderSummaryResponse,
  FinancialOverviewResponse,
  RevenuePointResponse,
  TopBookResponse,
  TopCustomerResponse,
  PaymentMethodStatsResponse
} from '../../../types/api/dashboard';

export const dashboardService = {
  getSummary: () =>
    apiClient.get<ApiResponse<OrderSummaryResponse>>('/api/dashboard/accountant/summary'),

  getFinancialOverview: (from: string, to: string) =>
    apiClient.get<ApiResponse<FinancialOverviewResponse>>('/api/dashboard/accountant/financial-overview', {
      params: { from, to },
    }),

  getRevenueByDay: (from: string, to: string) =>
    apiClient.get<ApiResponse<RevenuePointResponse[]>>('/api/dashboard/accountant/revenue', {
      params: { from, to },
    }),

  getTopBooks: (limit: number = 5) =>
    apiClient.get<ApiResponse<TopBookResponse[]>>('/api/dashboard/accountant/top-books', {
      params: { limit },
    }),

  getTopCustomers: (from: string, to: string, limit: number = 10) =>
    apiClient.get<ApiResponse<TopCustomerResponse[]>>('/api/dashboard/accountant/top-customers', {
      params: { from, to, limit },
    }),

  getPaymentMethodStats: (from: string, to: string) =>
    apiClient.get<ApiResponse<PaymentMethodStatsResponse[]>>('/api/dashboard/accountant/payment-methods', {
      params: { from, to },
    }),
};
