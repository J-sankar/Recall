import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from './api'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string>()
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const queryClient = useQueryClient()
  const sessionQuery = useQuery({
    queryKey: ['auth', 'session', accessToken],
    queryFn: () => authApi.me(accessToken!),
    enabled: Boolean(accessToken),
    retry: false,
  })

  useEffect(() => {
    void authApi
      .refresh()
      .then((token) => setAccessToken(token.access_token))
      .catch(() => setAccessToken(undefined))
      .finally(() => setIsRestoringSession(false))
  }, [])

  const authenticate = useCallback(async (action: (credentials: { email: string; password: string }) => Promise<{ access_token: string }>, credentials: { email: string; password: string }) => {
    const token = await action(credentials)
    setAccessToken(token.access_token)
    await queryClient.fetchQuery({
      queryKey: ['auth', 'session', token.access_token],
      queryFn: () => authApi.me(token.access_token),
      staleTime: 0,
    })
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      isRestoringSession,
      isAuthenticated: Boolean(accessToken) && !sessionQuery.isError,
      user: sessionQuery.data,
      login: (credentials) => authenticate(authApi.login, credentials),
      register: (credentials) => authenticate(authApi.register, credentials),
      logout: async () => {
        await authApi.logout()
        setAccessToken(undefined)
        queryClient.removeQueries({ queryKey: ['auth'] })
      },
    }),
    [accessToken, authenticate, isRestoringSession, queryClient, sessionQuery.data, sessionQuery.isError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
