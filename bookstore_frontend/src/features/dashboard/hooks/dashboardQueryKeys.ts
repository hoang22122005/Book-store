export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summaries: () => [...dashboardQueryKeys.all, 'summary'] as const,
  financialOverviews: () => [...dashboardQueryKeys.all, 'financial-overview'] as const,
  financialOverview: (params: { from: string; to: string }) =>
    [...dashboardQueryKeys.financialOverviews(), params] as const,
  revenues: () => [...dashboardQueryKeys.all, 'revenue'] as const,
  revenue: (params: { from: string; to: string }) => [...dashboardQueryKeys.revenues(), params] as const,
  topBooks: () => [...dashboardQueryKeys.all, 'top-books'] as const,
  topBook: (params?: { limit?: number }) => [...dashboardQueryKeys.topBooks(), params] as const,
  topCustomersList: () => [...dashboardQueryKeys.all, 'top-customers'] as const,
  topCustomers: (params: { from: string; to: string; limit?: number }) =>
    [...dashboardQueryKeys.topCustomersList(), params] as const,
  paymentMethodsStats: () => [...dashboardQueryKeys.all, 'payment-methods'] as const,
  paymentMethodsStat: (params: { from: string; to: string }) =>
    [...dashboardQueryKeys.paymentMethodsStats(), params] as const,
};
