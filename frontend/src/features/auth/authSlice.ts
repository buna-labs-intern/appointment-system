import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { AUTH_STORAGE_KEY } from '@/utils/constants'

export type AuthUser = {
  id: string
  email: string
  fullName?: string
  role: string
  mustChangePassword?: boolean
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  loading: boolean
}

function readStoredAuth(): Pick<AuthState, 'user' | 'token'> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return { user: null, token: null }
    const parsed = JSON.parse(raw)
    if (parsed?.user && parsed?.token) {
      return { user: parsed.user, token: parsed.token }
    }
    return { user: null, token: null }
  } catch {
    return { user: null, token: null }
  }
}

const stored = readStoredAuth()

const initialState: AuthState = {
  user: stored.user,
  token: stored.token,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
        }),
      )
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.user && state.auth.token)

export default authSlice.reducer
