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

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}
