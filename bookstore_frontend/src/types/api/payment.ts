import type { DateTime, Decimal } from './common'

export interface PaymentResponse {
  paymentId: number
  billId: number
  amount: Decimal
  method: string
  status: string
  txnRef: string
  transactionNo: string | null
  bankCode: string | null
  responseCode: string | null
  transactionStatus: string | null
  expiresAt: DateTime | null
  paidAt: DateTime | null
  createdAt: DateTime
}

export interface VnPayIpnResponse {
  rspCode: string
  message: string
}

export interface VnPayReturnResponse {
  validSignature: boolean
  successful: boolean
  txnRef: string
  responseCode: string
  transactionStatus: string
  message: string
}

export type VnPayParameters = Record<string, string>
