import api from '@/services/axios'
import type { AuthUser } from '@/features/auth/authSlice'
import type { Tenant } from '@/features/tenant/types'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: AuthUser
  token: string
  tenant: Tenant | null
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

function normalizeTenant(raw: any): Tenant | null {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw.tenantId
  if (!id) return null
  return {
    id: String(id),
    name: String(raw.name ?? raw.tenantName ?? 'Clinic'),
    slug: String(raw.slug ?? ''),
    email: raw.email ?? undefined,
    phone: raw.phone ?? undefined,
    address: raw.address ?? undefined,
  }
}

/** Falls back to the flat tenant fields some responses put on the user. */
function tenantFromUser(user: any): Tenant | null {
  if (!user?.tenantId) return null
  return {
    id: String(user.tenantId),
    name: String(user.tenantName ?? 'Clinic'),
    slug: String(user.tenantSlug ?? ''),
  }
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<any>('/auth/login', payload)
  const body = data?.data?.user && data?.data?.token ? data.data : data

  return {
    user: body?.user,
    token: body?.token,
    tenant:
      normalizeTenant(body?.tenant) ??
      normalizeTenant(body?.user?.tenant) ??
      tenantFromUser(body?.user),
  }
}

export async function changePasswordRequest(payload: ChangePasswordPayload) {
  const { data } = await api.post('/auth/change-password', payload)
  return data
}
