import { apiClient } from '../../../lib/apiClient';
import type { ApiResponse, PageResponse } from '../../../types/api/common';
import type {
  AdminUserResponse,
  AdminUserStatsResponse,
  AdminUserFilterParams,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  AdminResetPasswordRequest,
} from '../../../types/api/user';
import type { UserRole } from '../../../types/api/auth';

export const adminUserService = {
  getUsers: async (params: AdminUserFilterParams = {}) => {
    const { keyword, role, status, isDeleted, page = 0, size = 20, sort = 'userId,desc' } = params;

    const queryParams: Record<string, string | number | boolean> = {
      page,
      size,
      sort,
    };

    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim();
    }
    if (role && role !== 'ALL') {
      queryParams.role = role;
    }
    if (status && status !== 'ALL') {
      queryParams.status = status;
    }
    if (typeof isDeleted === 'boolean') {
      queryParams.isDeleted = isDeleted;
    }

    return apiClient.get<ApiResponse<PageResponse<AdminUserResponse>>>('/api/admin/users', {
      params: queryParams,
    });
  },

  getUserStats: async () => {
    return apiClient.get<ApiResponse<AdminUserStatsResponse>>('/api/admin/users/stats');
  },

  getUserById: async (userId: number) => {
    return apiClient.get<ApiResponse<AdminUserResponse>>(`/api/admin/users/${userId}`);
  },

  createUser: async (request: CreateUserByAdminRequest) => {
    return apiClient.post<ApiResponse<AdminUserResponse>>('/api/admin/users', request);
  },

  updateUser: async (userId: number, request: UpdateUserByAdminRequest) => {
    return apiClient.put<ApiResponse<AdminUserResponse>>(`/api/admin/users/${userId}`, request);
  },

  updateUserRole: async (userId: number, role: UserRole) => {
    const body: UpdateUserRoleRequest = { role };
    return apiClient.patch<ApiResponse<AdminUserResponse>>(`/api/admin/users/${userId}/role`, body);
  },

  updateUserStatus: async (userId: number, request: UpdateUserStatusRequest) => {
    return apiClient.patch<ApiResponse<AdminUserResponse>>(`/api/admin/users/${userId}/status`, request);
  },

  resetPassword: async (userId: number, request: AdminResetPasswordRequest) => {
    return apiClient.post<ApiResponse<void>>(`/api/admin/users/${userId}/reset-password`, request);
  },

  deleteUser: async (userId: number) => {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/users/${userId}`);
  },
};
