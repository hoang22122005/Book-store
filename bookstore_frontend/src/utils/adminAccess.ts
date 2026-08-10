import type { UserRole } from '../types';

export const adminRouteAccess = {
  '/admin': ['ADMIN', 'STAFF'],
  '/admin/books': ['ADMIN'],
  '/admin/vouchers': ['ADMIN'],
  '/admin/chat': ['ADMIN', 'STAFF'],
  '/admin/orders': ['ADMIN', 'STAFF'],
  '/admin/warehouse': ['WAREHOUSE_KEEPER'],
  '/admin/finance': ['ADMIN', 'ACCOUNTANT'],
} as const satisfies Record<string, readonly UserRole[]>;

export type AdminRoute = keyof typeof adminRouteAccess;

export const canAccessAdminRoute = (role: UserRole | null | undefined, path: AdminRoute): boolean =>
  Boolean(role && (adminRouteAccess[path] as readonly UserRole[]).includes(role));

export const getDefaultAdminPath = (role: UserRole | null | undefined): AdminRoute | null =>
  (Object.keys(adminRouteAccess) as AdminRoute[]).find((path) => canAccessAdminRoute(role, path)) ?? null;
