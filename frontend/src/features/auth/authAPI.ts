import api from '@/services/axios'
import type { AuthUser } from '@/features/auth/authSlice'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: AuthUser
  token: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<any>('/auth/login', payload)
  if (data && data.data && data.data.user && data.data.token) {
    return {
      user: data.data.user,
      token: data.data.token,
    }
  }
  return data
}

export async function changePasswordRequest(payload: ChangePasswordPayload) {
  const { data } = await api.post('/auth/change-password', payload)
  return data
}
