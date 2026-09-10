import { apiPost } from '@/lib/api'
import type { AdminUser, AuthSession } from '@/types/api'

type LoginResponseData = {
  token: string
  user: AdminUser
  tenant?: unknown
}

export async function loginRequest(payload: { email: string; password: string }): Promise<AuthSession> {
  const envelope = await apiPost<LoginResponseData>('/auth/login', payload)
  const body = envelope.data

  if (body.user.role !== 'SUPER_ADMIN') {
    throw new Error('This dashboard is for platform administrators only.')
  }

  return {
    user: body.user,
    token: body.token,
    tenant: null,
  }
}

export async function changePasswordRequest(payload: {
  currentPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  const envelope = await apiPost<{ message: string }>('/auth/change-password', payload)
  return envelope.data
}
