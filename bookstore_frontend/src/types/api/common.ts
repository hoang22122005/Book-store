export type DateOnly = string
export type DateTime = string
export type Decimal = number

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data?: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface PageQuery {
  page?: number
  size?: number
  sort?: string
}

export type EmptyResponse = null
