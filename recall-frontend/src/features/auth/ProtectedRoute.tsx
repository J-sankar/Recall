import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession } = useAuth()
  if (isRestoringSession) return <p className="text-sm text-slate-600">Restoring your session…</p>
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />
}
