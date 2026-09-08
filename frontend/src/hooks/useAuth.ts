import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { queryClient } from '@/app/queryClient'
import {
  logout as logoutAction,
  selectAuth,
  selectIsAuthenticated,
  selectTenantId,
  setCredentials,
  setTenant as setTenantAction,
  type AuthUser,
} from '@/features/auth/authSlice'
import type { Tenant } from '@/features/tenant/types'

export default function useAuth() {
  const dispatch = useAppDispatch()
  const { user, token, tenant, loading } = useAppSelector(selectAuth)
  const tenantId = useAppSelector(selectTenantId)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const login = useCallback(
    (authUser: AuthUser, authToken: string, authTenant: Tenant | null = null) => {
      // Drop any records cached for the previous session before the new tenant loads.
      queryClient.clear()
      dispatch(setCredentials({ user: authUser, token: authToken, tenant: authTenant }))
    },
    [dispatch],
  )

  const setTenant = useCallback(
    (nextTenant: Tenant | null) => {
      queryClient.clear()
      dispatch(setTenantAction(nextTenant))
    },
    [dispatch],
  )

  const logout = useCallback(() => {
    dispatch(logoutAction())
    queryClient.clear()
  }, [dispatch])

  return {
    user,
    token,
    tenant,
    tenantId,
    loading,
    isAuthenticated,
    login,
    setTenant,
    logout,
  }
}
