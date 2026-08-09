import type {
  DateTime,
  Decimal,
  PageQuery,
} from './common'

export interface BookResponse {
  bookId: number
  name: string
  author: string
  description: string | null
  quantityInStock: number
  publisher: string | null
  publishYear: number | null
  price: Decimal
  salePrice: Decimal | null
  discountPercent: Decimal | null
  activeCampaignId: number | null
  activeCampaignName: string | null
  createdAt: DateTime
  urlImg: string | null
  avgRating: number
  cntRating: number
  buyCount: number
  isbn: string | null
  pageCount: number | null
  isVip: boolean
  genres: string[]
}

export interface BookRequest {
  name: string
  isbn: string
  author: string
  description?: string | null
  quantityInStock: number
  publisher?: string | null
  publishYear?: number | null
  price: Decimal
  pageCount?: number | null
  isVip: boolean
}

export interface BookAddRequest {
  name: string
  author: string
  description: string
  quantityInStock: number
  publisher: string
  publishYear: number
  price: Decimal
  createdAt?: DateTime | null
  isVip: boolean
  pageCount: number
  genreName: string
}

export interface BookUpdateRequest {
  name: string
  author: string
  description: string
  quantityInStock: number
  publisher: string
  publishYear: number
  price: Decimal
  isVip: boolean
  isDeleted: boolean
  deletedAt?: DateTime | null
  pageCount: number
}

export interface BookEntityResponse {
  bookId: number
  name: string
  isbn: string | null
  author: string
  description: string | null
  isVip: boolean
  pageCount: number
  quantityInStock: number
  publisher: string | null
  publishYear: number | null
  price: Decimal
  createdAt: DateTime
  deletedAt: DateTime | null
  isDeleted: boolean
  urlImg: string | null
  avgRating: number
  cntRating: number
  buyCount: number
  publicId: string | null
}

export interface RecommendationItem {
  itemId: number
  score: number
  similarity: number
}

export interface RecommendationResponse {
  userId: number
  itemId: number
  recommendations: RecommendationItem[]
}

export interface BookListQuery extends PageQuery {
  keyword?: string
  author?: string
  categoryId?: number
  minPrice?: Decimal
  maxPrice?: Decimal
  inStock?: boolean
}

export interface RecommendationQuery {
  page?: number
  size?: number
  topK?: number
}

export interface BookAddMultipartRequest {
  bookAddRequest: BookAddRequest
  imgFile: File
}

export interface BookUpdateMultipartRequest {
  bookUpdateRequest: BookUpdateRequest
  imgFile: File
}
