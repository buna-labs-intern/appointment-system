import api from '@/services/axios'
import type { Receptionist } from '@/features/users/types'

export type ReceptionistPayload = {
  fullName: string
  email: string
  password?: string
  isActive?: boolean
  role?: 'RECEPTIONIST'
}

function normalizeUsers(data: any): Receptionist[] {
  let list: any[] = []
  if (Array.isArray(data)) list = data
  else if (data && typeof data === 'object' && Array.isArray(data.data)) list = data.data
  return list.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role || 'RECEPTIONIST',
    isActive: u.isActive !== undefined ? u.isActive : true,
    joinDate: u.createdAt
      ? new Date(u.createdAt).toISOString().slice(0, 10)
      : (u.joinDate || new Date().toISOString().slice(0, 10)),
  }))
}

export async function getReceptionists(params?: Record<string, unknown>): Promise<Receptionist[]> {
  try {
    const { data } = await api.get('/users', { params })
    return normalizeUsers(data)
  } catch (error) {
    console.error('Failed to get receptionists:', error)
    return []
  }
}

export async function createReceptionist(payload: ReceptionistPayload): Promise<Receptionist> {
  const { data } = await api.post('/users', {
    ...payload,
    role: 'RECEPTIONIST',
  })
  const normalized = normalizeUsers([data?.data || data])[0]
  return normalized
}

export async function updateReceptionist(
  id: string | number,
  payload: Partial<ReceptionistPayload>,
): Promise<Receptionist> {
  const { data } = await api.put(`/users/${id}`, payload)
  const normalized = normalizeUsers([data?.data || data])[0]
  return normalized
}

export async function activateReceptionist(id: string | number): Promise<void> {
  await api.patch(`/users/${id}/activate`, {})
}

export async function deactivateReceptionist(id: string | number): Promise<void> {
  await api.patch(`/users/${id}/deactivate`, {})
}

export async function deleteReceptionist(id: string | number): Promise<void> {
  await api.delete(`/users/${id}`)
}