import type { UserRole } from '../types';

export const backofficeRoles = ['ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER'] as const;

export const adminRouteAccess = {
  '/admin': ['ADMIN', 'ACCOUNTANT'],
  '/admin/books': ['ADMIN', 'WAREHOUSE_KEEPER'],
  '/admin/vouchers': ['ADMIN'],
  '/admin/chat': ['ADMIN', 'STAFF'],
  '/admin/orders': ['ADMIN', 'STAFF'],
  '/admin/warehouse': ['WAREHOUSE_KEEPER'],
  '/admin/finance': ['ADMIN', 'ACCOUNTANT'],
} as const satisfies Record<string, readonly UserRole[]>;

export type AdminRoute = keyof typeof adminRouteAccess;

const defaultAdminPathByRole: Partial<Record<UserRole, AdminRoute>> = {
  ADMIN: '/admin',
  STAFF: '/admin/orders',
  ACCOUNTANT: '/admin/finance',
  WAREHOUSE_KEEPER: '/admin/warehouse',
};

export const isBackofficeRole = (role: UserRole | null | undefined): boolean =>
  Boolean(role && (backofficeRoles as readonly UserRole[]).includes(role));

export const canAccessAdminRoute = (role: UserRole | null | undefined, path: AdminRoute): boolean =>
  Boolean(role && (adminRouteAccess[path] as readonly UserRole[]).includes(role));

export const getDefaultAdminPath = (role: UserRole | null | undefined): AdminRoute | null =>
  role && defaultAdminPathByRole[role] && canAccessAdminRoute(role, defaultAdminPathByRole[role])
    ? defaultAdminPathByRole[role]
    : null;
