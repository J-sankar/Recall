import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { ResourceSkeletons } from '../../components/ui/Skeleton'

export function ProtectedRoute() {
  const { isAuthenticated, isRestoringSession } = useAuth()
  if (isRestoringSession) return <ResourceSkeletons />
  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />
}
