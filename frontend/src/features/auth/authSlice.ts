import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { AUTH_STORAGE_KEY } from '@/utils/constants'
import type { Tenant } from '@/features/tenant/types'

export type AuthUser = {
  id: string
  email: string
  fullName?: string
  role: string
  tenantId?: string
  mustChangePassword?: boolean
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  tenant: Tenant | null
  loading: boolean
}

type StoredAuth = Pick<AuthState, 'user' | 'token' | 'tenant'>

const emptyAuth: StoredAuth = { user: null, token: null, tenant: null }

function readStoredAuth(): StoredAuth {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return emptyAuth
    const parsed = JSON.parse(raw)
    if (parsed?.user && parsed?.token) {
      return {
        user: parsed.user,
        token: parsed.token,
        tenant: parsed.tenant ?? null,
      }
    }
    return emptyAuth
  } catch {
    return emptyAuth
  }
}

function persistAuth(auth: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

const stored = readStoredAuth()

const initialState: AuthState = {
  user: stored.user,
  token: stored.token,
  tenant: stored.tenant,
  loading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; token: string; tenant?: Tenant | null }>,
    ) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.tenant = action.payload.tenant ?? null
      persistAuth({ user: state.user, token: state.token, tenant: state.tenant })
    },
    setTenant(state, action: PayloadAction<Tenant | null>) {
      state.tenant = action.payload
      if (state.user && state.token) {
        persistAuth({ user: state.user, token: state.token, tenant: state.tenant })
      }
    },
    logout(state) {
      state.user = null
      state.token = null
      state.tenant = null
      localStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
})

export const { setCredentials, setTenant, logout } = authSlice.actions

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectToken = (state: { auth: AuthState }) => state.auth.token
export const selectTenant = (state: { auth: AuthState }) => state.auth.tenant
export const selectTenantId = (state: { auth: AuthState }) =>
  state.auth.tenant?.id ?? state.auth.user?.tenantId ?? null
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.user && state.auth.token)

export default authSlice.reducer
