import type { DateTime } from './common'

export interface CreateVoucherRequest {
  userIds?: number[] | null
  code: string
  discount: number
  expiredAt: DateTime
}

export interface VoucherResponse {
  voucherId: number
  code: string
  scope: string
  discountPercent: number
  expiredAt: DateTime
  assignedUserIds?: number[]
  assignedCount?: number
  userId?: number
  userEmail?: string
  claimed?: boolean
  used?: boolean
  usedAt?: DateTime
}
