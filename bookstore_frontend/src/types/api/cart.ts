import type { DateTime, Decimal } from './common'

export interface CartRequest {
  userId: number
}

export interface CartResponse {
  cartId: number
  userId: number
  totalAmount: Decimal
  createdAt: DateTime
}

export interface CartDetailRequest {
  bookId: number
}

export interface CartDetailResponse {
  cartId: number
  userId: number
  createdAt: DateTime
  bookId: number
  bookName: string
  author: string
  price: Decimal
  quantity: number
}
