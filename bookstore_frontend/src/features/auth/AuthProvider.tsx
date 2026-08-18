import { useCallback, useEffect, useMemo, useState, type PropsWithChildren, } from 'react'
import { onSessionExpired, refreshSession, } from '../../lib/api/client'
import { getRoleFromToken } from '../../lib/auth/jwt'
import { tokenStorage } from '../../lib/auth/tokenStorage'
import { queryClient } from '../../lib/query/queryClient'
import type { LoginRequest, UserResponse, UserRole, } from '../../types/api'
import { authApi } from './api/authApi'
import { AuthContext, type AuthStatus, } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<UserResponse | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)

  const clearSessionState = useCallback(() => {
    tokenStorage.clear()
    queryClient.clear()
    setUser(null)
    setRole(null)
    setStatus('unauthenticated')
  }, [])

  const loadAuthenticatedUser = useCallback(async () => {
    const accessToken = tokenStorage.getAccessToken()

    if (!accessToken) {
      throw new Error('Không tìm thấy access token.')
    }

    const profile = await authApi.getProfile()
    setUser(profile)
    setRole(getRoleFromToken(accessToken))
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    let active = true

    const unsubscribe = onSessionExpired(() => {
      if (active) {
        clearSessionState()
      }
    })

    async function restoreSession() {
      if (!tokenStorage.getRefreshToken()) {
        if (active) {
          setStatus('unauthenticated')
        }
        return
      }

      try {
        await refreshSession()

        if (active) {
          await loadAuthenticatedUser()
        }
      } catch {
        if (active) {
          clearSessionState()
        }
      }
    }

    void restoreSession()

    return () => {
      active = false
      unsubscribe()
    }
  }, [clearSessionState, loadAuthenticatedUser])

  const login = useCallback(
    async (request: LoginRequest) => {
      const tokens = await authApi.login(request)
      tokenStorage.setTokens(tokens)

      try {
        await loadAuthenticatedUser()
      } catch (error) {
        clearSessionState()
        throw error
      }
    },
    [clearSessionState, loadAuthenticatedUser],
  )

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // Logout phía client vẫn phải hoàn tất nếu server/token không còn khả dụng.
    } finally {
      clearSessionState()
    }
  }, [clearSessionState])

  const contextValue = useMemo(
    () => ({
      status,
      user,
      role,
      isAuthenticated: status === 'authenticated',
      login,
      logout,
    }),
    [login, logout, role, status, user],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
