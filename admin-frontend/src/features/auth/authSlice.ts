import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/lib/api'
import type { AdminUser } from '@/types/api'

type AuthState = {
  user: AdminUser | null
  token: string | null
}

function readInitial(): AuthState {
  const stored = readStoredAuth()
  if (stored && stored.user.role === 'SUPER_ADMIN') {
    return { user: stored.user as AdminUser, token: stored.token }
  }
  return { user: null, token: null }
}

const initialState: AuthState = readInitial()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<{ user: AdminUser; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      writeStoredAuth({ user: action.payload.user, token: action.payload.token })
    },
    logout(state) {
      state.user = null
      state.token = null
      clearStoredAuth()
    },
  },
})

export const { setSession, logout } = authSlice.actions

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.user && state.auth.token)

export default authSlice.reducer
