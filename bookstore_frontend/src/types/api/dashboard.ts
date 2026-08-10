import type { DateOnly, Decimal } from './common'

export interface DeliveryResultRequest {
  successful: boolean
}

export interface OrderSummaryResponse {
  totalRevenue: Decimal
  totalOrders: number
  ordersByStatus: Record<string, number>
}

export interface RevenuePointResponse {
  date: DateOnly
  revenue: Decimal
}

export interface TopBookResponse {
  bookId: number
  bookName: string
  quantitySold: number
  revenue: Decimal
}

export interface RevenueQuery {
  from: DateOnly
  to: DateOnly
}

export interface TopBooksQuery {
  limit?: number
}

export interface FinancialOverviewResponse {
  from: string;
  to: string;
  revenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  completionRatePercent: number;
  itemsSold: number;
  averageOrderValue: number;
  subtotalBeforeVoucher: number;
  voucherDiscount: number;
}

export interface TopCustomerResponse {
  userId: number;
  name: string;
  email: string;
  completedOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface PaymentMethodStatsResponse {
  paymentMethod: string;
  orderCount: number;
  revenue: number;
}
