import type { DateTime } from './common'

export interface ImportStockRequest {
  quantity: number
}

export interface AddStockImportDetailRequest {
  bookId: number
  quantity: number
}

export interface CreateStockImportRequest {
  note?: string | null
  details: AddStockImportDetailRequest[]
}

export interface StockImportDetailResponse {
  importDetailId: number
  bookId: number
  bookName: string
  quantity: number
}

export interface StockImportResponse {
  importId: number
  status: string
  note?: string | null
  createdByName: string
  createdAt: DateTime
  postedAt?: DateTime | null
  details: StockImportDetailResponse[]
}
