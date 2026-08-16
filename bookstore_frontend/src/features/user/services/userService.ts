import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse } from '../../../types/api/common';
import type { UserResponse, UpdateUserRequest, ChangePasswordRequest } from '../../../types/api/user';
import type { User } from '../../../types';
import { formatUserData } from '../../../utils';

export type { User };

export const transformUserResponse = (dto: UserResponse): User => {
  return formatUserData(dto);
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

  saveGenrePreferences: async (genreIds: number[]): Promise<User> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/user/preferences/genres', { genreIds });
    if (!response.data.data) {
      throw new Error(response.data.message || 'Không thể lưu sở thích thể loại');
    }
    return transformUserResponse(response.data.data);
  },

  getGenrePreferences: async (): Promise<number[]> => {
    const response = await apiClient.get<ApiResponse<number[]>>('/api/user/preferences/genres');
    return response.data.data ?? [];
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    const response = await apiClient.patch<ApiResponse<void>>('/api/user/me/password', data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Không thể đổi mật khẩu');
    }
  },

  uploadAvatar: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.patch<ApiResponse<UserResponse>>('/api/user/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    if (!response.data.data) {
      throw new Error('Không thể cập nhật ảnh đại diện');
    }
    return transformUserResponse(response.data.data);
  },
};
