import { createContext } from 'react'
import type { AuthUser } from './api'

type Credentials = { email: string; password: string }

export type AuthContextValue = {
  isRestoringSession: boolean
  isAuthenticated: boolean
  accessToken: string | undefined
  user: AuthUser | undefined
  login: (credentials: Credentials) => Promise<void>
  register: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
