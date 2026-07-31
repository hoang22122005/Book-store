import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../../../types/api';

export const authService = {
  login: (credentials: LoginRequest) => apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials),
  register: (credentials: RegisterRequest) => apiClient.post<ApiResponse<void>>('/api/auth/register', credentials),
  getProfile: () => apiClient.get<ApiResponse<UserResponse>>('/api/user/me'),
  logout: (refreshToken?: string) => apiClient.post<ApiResponse<void>>('/api/user/logout', { refreshToken }),
};
