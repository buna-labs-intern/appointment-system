import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  logout as logoutAction,
  selectAuth,
  selectIsAuthenticated,
  setCredentials,
  type AuthUser,
} from '@/features/auth/authSlice'

export default function useAuth() {
  const dispatch = useAppDispatch()
  const { user, token, loading } = useAppSelector(selectAuth)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const login = useCallback(
    (authUser: AuthUser, authToken: string) => {
      dispatch(setCredentials({ user: authUser, token: authToken }))
    },
    [dispatch],
  )

  const logout = useCallback(() => {
    dispatch(logoutAction())
  }, [dispatch])

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
  }
}
