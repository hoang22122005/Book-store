import type { UserRole } from './auth';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'LOCKED';

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  address: string | null;
  gender: string | null;
  career: string | null;
  urlAvt: string | null;
  role: UserRole;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  phoneNumber: string | null;
  address: string | null;
  dob: string | null;
  gender: string | null;
  career: string | null;
  urlAvt: string | null;
  isVip: boolean;
  vipExpiration: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface AdminUserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  staffAndAdmins: number;
  vipUsers: number;
}

export interface UpdateUserRequest {
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  career?: string | null;
  urlAvt?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserByAdminRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  career?: string;
  status?: AccountStatus;
  isVip?: boolean;
}

export interface UpdateUserByAdminRequest {
  name?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  career?: string;
  urlAvt?: string;
  role?: UserRole;
  status?: AccountStatus;
  isDeleted?: boolean;
  isVip?: boolean;
  vipExpiration?: string | null;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status?: AccountStatus;
  isDeleted?: boolean;
}

export interface AdminResetPasswordRequest {
  newPassword: string;
}

export interface AdminUserFilterParams {
  keyword?: string;
  role?: UserRole | 'ALL';
  status?: AccountStatus | 'ALL';
  isDeleted?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}
