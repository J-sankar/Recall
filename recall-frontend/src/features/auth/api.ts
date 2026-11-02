import { apiFetch, apiJson } from '../../lib/api'

export type AuthUser = { id: string; email: string }
type TokenResponse = { access_token: string; token_type: 'bearer' }
type Credentials = { email: string; password: string }

function jsonRequest(method: 'POST', body?: Credentials): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }
}

export const authApi = {
  register: (credentials: Credentials) => apiJson<TokenResponse>('/auth/register', jsonRequest('POST', credentials)),
  login: (credentials: Credentials) => apiJson<TokenResponse>('/auth/login', jsonRequest('POST', credentials)),
  refresh: () => apiJson<TokenResponse>('/auth/refresh', jsonRequest('POST')),
  me: (accessToken: string) =>
    apiJson<AuthUser>('/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } }),
  logout: () => apiFetch('/auth/logout', jsonRequest('POST')),
}
