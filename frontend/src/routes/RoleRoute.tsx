import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

type RoleRouteProps = {
  allowedRoles?: string[]
}

export default function RoleRoute({ allowedRoles = [] }: RoleRouteProps) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
