import type { User, UserRole } from '../types';
import type { UserResponse } from '../types/api';

/**
 * Kiểm tra xem người dùng có vai trò Quản trị / Nhân viên không
 */
export const isAdminOrStaffRole = (role?: UserRole | null): boolean => {
  if (!role) return false;
  return ['ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER'].includes(role);
};

/**
 * Lấy tên tiếng Việt hiển thị cho từng Vai trò
 */
export const getRoleDisplayName = (role?: UserRole | null): string => {
  switch (role) {
    case 'ADMIN':
      return 'Quản Trị Viên';
    case 'STAFF':
      return 'Nhân Viên Bán Hàng';
    case 'ACCOUNTANT':
      return 'Kế Toán';
    case 'WAREHOUSE_KEEPER':
      return 'Thủ Kho';
    case 'USER':
    default:
      return 'Khách Hàng';
  }
};

/**
 * Chuẩn hóa đối tượng User từ dữ liệu API phản hồi hoặc JWT Claims
 */
export const formatUserData = (raw: UserResponse): User => {
  const formattedRole = raw.role.replace('ROLE_', '').toUpperCase() as UserRole;

  return {
    id: raw.id,
    email: raw.email,
    name: raw.fullName,
    role: formattedRole,
    phone: raw.phoneNumber ?? undefined,
    address: raw.address ?? undefined,
    avatarUrl: raw.urlAvt ?? undefined,
  };
};
