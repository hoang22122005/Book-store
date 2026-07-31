import type { DateOnly } from './common'

export type UserRole =
  | 'USER'
  | 'CLONE'
  | 'ADMIN'
  | 'ACCOUNTANT'
  | 'STAFF'
  | 'WAREHOUSE_KEEPER'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  dob?: DateOnly | null
  address?: string | null
  phone?: string | null
  gender?: string | null
  career?: string | null
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  role: UserRole
  user: import('./user').UserResponse
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export type LogoutRequest = RefreshTokenRequest

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface JwtPayload {
  userId: number
  role: string
  sub: string
  iat: number
  exp: number
}
