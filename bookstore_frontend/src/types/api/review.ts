import type { DateTime, PageQuery } from './common'

export interface CommentRequest {
  content: string
}

export interface CommentResponse {
  commentId: number
  bookId: number
  bookName: string
  userId: number
  userName: string
  content: string
  createdAt: DateTime
}

export interface RatingRequest {
  bookId: number
  ratingValue: number
}

export interface RatingResponse {
  ratingId: number
  bookId: number
  bookName: string
  userId: number
  userName: string
  ratingValue: number
}

export interface ReviewListQuery extends PageQuery {
  bookId?: number
}
