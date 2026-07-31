export interface UserResponse {
  id: number
  email: string
  fullName: string
  phoneNumber: string | null
  address: string | null
  gender: string | null
  career: string | null
  urlAvt: string | null
  role: import('./auth').UserRole
}

export interface UpdateUserRequest {
  name?: string | null
  phone?: string | null
  address?: string | null
  gender?: string | null
  career?: string | null
  urlAvt?: string | null
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
