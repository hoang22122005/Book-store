import { createContext } from 'react';
import type { User, UserRole } from '../types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  setUser: (user: User | null) => void;
  demoLogin: (role: UserRole) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
