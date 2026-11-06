
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { authApi } from './api'
import {
  AuthContext,
  type AuthContextValue,
  type SessionRestoreError,
} from './authContext'

type Credentials = {
  email: string
  password: string
}

function isUnauthorizedError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 401
  )
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [accessToken, setAccessToken] = useState<string>()
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [sessionRestoreError, setSessionRestoreError] =
    useState<SessionRestoreError>(null)

  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: ['auth', 'session', accessToken],
    queryFn: () => authApi.me(accessToken!),
    enabled: Boolean(accessToken),
    retry: false,
  })

  // Restore the session using the HTTP-only refresh cookie.
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const token = await authApi.refresh()

        if (cancelled) return

        setAccessToken(token.access_token)
        setSessionRestoreError(null)
      } catch (error) {
        if (cancelled) return

        setSessionRestoreError(
          isUnauthorizedError(error) ? 'unauthorized' : 'unavailable',
        )
      } finally {
        if (!cancelled) {
          setIsRestoringSession(false)
        }
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  // Shared login and registration logic.
  const authenticate = useCallback(
    async (
      action: (
        credentials: Credentials,
      ) => Promise<{ access_token: string }>,
      credentials: Credentials,
    ) => {
      const token = await action(credentials)

      setAccessToken(token.access_token)
      setSessionRestoreError(null)

      await queryClient.invalidateQueries({
        queryKey: ['auth', 'session'],
      })
    },
    [queryClient],
  )

  const login = useCallback(
    (credentials: Credentials) =>
      authenticate(authApi.login, credentials),
    [authenticate],
  )

  const register = useCallback(
    (credentials: Credentials) =>
      authenticate(authApi.register, credentials),
    [authenticate],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setAccessToken(undefined)
      setSessionRestoreError(null)

      queryClient.removeQueries({
        queryKey: ['auth'],
      })
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      isRestoringSession,
      isAuthenticated: Boolean(accessToken),
      sessionRestoreError,
      accessToken,
      user: sessionQuery.data,
      login,
      register,
      logout,
    }),
    [
      accessToken,
      isRestoringSession,
      sessionRestoreError,
      sessionQuery.data,
      login,
      register,
      logout,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
