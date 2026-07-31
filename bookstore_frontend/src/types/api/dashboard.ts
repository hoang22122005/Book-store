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
