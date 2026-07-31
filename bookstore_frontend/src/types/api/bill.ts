import type { DateTime, Decimal } from './common'
import type { PaymentResponse } from './payment'

export interface BillDetailResponse {
  billDetailId: number
  bookId: number
  bookName: string
  quantity: number
  priceAtPurchase: Decimal
  subTotal: Decimal
}

export interface BillResponse {
  billId: number
  userId: number
  userEmail: string
  voucherId?: number
  voucherCode?: string
  voucherScope?: string
  discountPercent?: number
  subTotal: Decimal
  discountAmount: Decimal
  totalAmount: Decimal
  status: string | null
  inventoryStatus: string | null
  createdAt: DateTime
  details: BillDetailResponse[]
}

export interface CreateBillRequest {
  voucherCode?: string | null
  selectedBookIds?: number[] | null
  paymentMethod: string
  bankCode?: string | null
}

export interface UpdateBillStatusRequest {
  status: string
}

export interface CheckoutResponse {
  bill: BillResponse
  payment: PaymentResponse
  paymentUrl?: string
}
