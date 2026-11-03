const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export const apiBaseUrl = configuredBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!response.ok) throw new ApiError(response.status)
  return response
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init)
  return response.json() as Promise<T>
}
