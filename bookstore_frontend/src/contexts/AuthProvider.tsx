import { useEffect, useState, type PropsWithChildren } from 'react';
import { useAuthSessionApi } from '../features/auth/hooks';
import { tokenStorage } from '../utils';
import { AuthContext } from './AuthContext';
import type { User } from '../types';
import type { UserRole } from '../types';

export function AuthProvider({ children }: PropsWithChildren) {
  const { getProfile, notifyLogout } = useAuthSessionApi();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        if (isMounted) setUser(profile);
      } catch {
        // A token is not proof of authentication; only a successful profile response is.
        tokenStorage.clearTokens();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initAuth();
    const handleUnauthorized = () => {
      tokenStorage.clearTokens();
      if (isMounted) setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [getProfile]);

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) await notifyLogout(refreshToken);
    } catch (error) {
      console.warn('Logout API notification failed', error);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const demoLogin = (role: UserRole) => {
    if (!import.meta.env.DEV) return;
    setUser({ id: `demo-${role}`, email: `demo-${role.toLowerCase()}@example.test`, name: `Demo ${role}`, role });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, role: user?.role ?? null, setUser, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
