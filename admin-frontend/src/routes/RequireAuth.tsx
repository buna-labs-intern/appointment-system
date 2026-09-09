import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/app/store'

export default function RequireAuth() {
  const { user, token } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
