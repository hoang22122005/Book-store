import type { UserRole as ApiUserRole } from './api/auth';

export type UserRole = ApiUserRole;

export interface User {
  id?: number | string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  dob?: string;
  gender?: string;
  career?: string;
  isVip?: boolean;
  hasSelectedPreferences?: boolean;
  preferredGenreIds?: number[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
