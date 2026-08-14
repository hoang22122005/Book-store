import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, UserResponse } from '../../../types/api';

export const authService = {
  login: (credentials: LoginRequest) => apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials),
  register: (credentials: RegisterRequest) => apiClient.post<ApiResponse<void>>('/api/auth/register', credentials),
  verifyEmail: (token: string) => apiClient.get<ApiResponse<void>>(`/api/auth/verify-email?token=${token}`),
  forgotPassword: (request: ForgotPasswordRequest) => apiClient.post<ApiResponse<void>>('/api/auth/forgot-password', request),
  resetPassword: (request: ResetPasswordRequest) => apiClient.post<ApiResponse<void>>('/api/auth/reset-password', request),
  getProfile: () => apiClient.get<ApiResponse<UserResponse>>('/api/user/me'),
  logout: (refreshToken?: string) => apiClient.post<ApiResponse<void>>('/api/user/logout', { refreshToken }),
};
