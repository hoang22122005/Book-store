import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api/common';
import type { UserResponse, UpdateUserRequest, ChangePasswordRequest } from '../../../types/api/user';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  gender?: string;
  career?: string;
  avatarUrl?: string;
  role: string;
}

export const transformUserResponse = (dto: UserResponse): User => {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.fullName,
    phone: dto.phoneNumber ?? undefined,
    address: dto.address ?? undefined,
    gender: dto.gender ?? undefined,
    career: dto.career ?? undefined,
    avatarUrl: dto.urlAvt ?? undefined,
    role: dto.role,
  };
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>('/api/user/me');
    if (!response.data.data) {
      throw new Error('Không thể lấy thông tin cá nhân');
    }
    return transformUserResponse(response.data.data);
  },

  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>('/api/user/me', data);
    if (!response.data.data) {
      throw new Error('Không thể cập nhật thông tin');
    }
    return transformUserResponse(response.data.data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.patch<ApiResponse<void>>('/api/user/me/password', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể đổi mật khẩu');
    }
  },
};
