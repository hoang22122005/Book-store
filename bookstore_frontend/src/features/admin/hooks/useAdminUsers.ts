import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../services/adminUserService';
import type {
  AdminUserResponse,
  AdminUserStatsResponse,
  AdminUserFilterParams,
  CreateUserByAdminRequest,
  UpdateUserByAdminRequest,
  UpdateUserStatusRequest,
  AdminResetPasswordRequest,
} from '../../../types/api/user';
import type { PageResponse } from '../../../types/api/common';
import type { UserRole } from '../../../types/api/auth';

export const adminUserQueryKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserQueryKeys.all, 'list'] as const,
  list: (params: AdminUserFilterParams) => [...adminUserQueryKeys.lists(), params] as const,
  stats: () => [...adminUserQueryKeys.all, 'stats'] as const,
  detail: (id: number) => [...adminUserQueryKeys.all, 'detail', id] as const,
};

export const useAdminUsersQuery = (params: AdminUserFilterParams = {}) =>
  useQuery<PageResponse<AdminUserResponse>, Error>({
    queryKey: adminUserQueryKeys.list(params),
    queryFn: async () => {
      const response = await adminUserService.getUsers(params);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải danh sách người dùng');
      }
      return response.data.data;
    },
  });

export const useAdminUserStatsQuery = () =>
  useQuery<AdminUserStatsResponse, Error>({
    queryKey: adminUserQueryKeys.stats(),
    queryFn: async () => {
      const response = await adminUserService.getUserStats();
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải thống kê người dùng');
      }
      return response.data.data;
    },
  });

export const useAdminUserDetailQuery = (userId: number | null) =>
  useQuery<AdminUserResponse, Error>({
    queryKey: adminUserQueryKeys.detail(userId ?? 0),
    queryFn: async () => {
      if (!userId) throw new Error('User ID không hợp lệ');
      const response = await adminUserService.getUserById(userId);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tải thông tin người dùng');
      }
      return response.data.data;
    },
    enabled: !!userId,
  });

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminUserResponse, Error, CreateUserByAdminRequest>({
    mutationFn: async (request) => {
      const response = await adminUserService.createUser(request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể tạo người dùng mới');
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminUserResponse, Error, { userId: number; request: UpdateUserByAdminRequest }>({
    mutationFn: async ({ userId, request }) => {
      const response = await adminUserService.updateUser(userId, request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể cập nhật người dùng');
      }
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.detail(variables.userId) });
    },
  });
};

export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminUserResponse, Error, { userId: number; role: UserRole }>({
    mutationFn: async ({ userId, role }) => {
      const response = await adminUserService.updateUserRole(userId, role);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể cập nhật vai trò');
      }
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.detail(variables.userId) });
    },
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminUserResponse, Error, { userId: number; request: UpdateUserStatusRequest }>({
    mutationFn: async ({ userId, request }) => {
      const response = await adminUserService.updateUserStatus(userId, request);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Không thể cập nhật trạng thái');
      }
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.detail(variables.userId) });
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation<void, Error, { userId: number; request: AdminResetPasswordRequest }>({
    mutationFn: async ({ userId, request }) => {
      const response = await adminUserService.resetPassword(userId, request);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể đặt lại mật khẩu');
      }
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (userId) => {
      const response = await adminUserService.deleteUser(userId);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể thay đổi trạng thái tài khoản');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserQueryKeys.all });
    },
  });
};
