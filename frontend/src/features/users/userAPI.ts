import api from '@/services/axios'
import type { Receptionist } from '@/features/users/types'
import { mockReceptionists } from '@/features/users/mockData'

export type ReceptionistPayload = {
  fullName: string
  email: string
  password?: string
  isActive?: boolean
  role?: 'RECEPTIONIST'
}

let localStaff = [...mockReceptionists]

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
    joinDate: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : (u.joinDate || new Date().toISOString().slice(0, 10)),
  }))
}

export async function getReceptionists(params?: Record<string, unknown>): Promise<Receptionist[]> {
  try {
    const { data } = await api.get('/users', { params, timeout: 2000 })
    const normalized = normalizeUsers(data)
    return normalized.length > 0 ? normalized : localStaff
  } catch {
    return localStaff
  }
}

export async function createReceptionist(payload: ReceptionistPayload): Promise<Receptionist> {
  try {
    const { data } = await api.post('/users', {
      ...payload,
      role: 'RECEPTIONIST',
    }, { timeout: 2000 })
    const normalized = normalizeUsers([data?.data || data])[0]
    localStaff = [normalized, ...localStaff]
    return normalized
  } catch {
    const next: Receptionist = {
      id: crypto.randomUUID(),
      fullName: payload.fullName,
      email: payload.email,
      role: 'RECEPTIONIST',
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      joinDate: new Date().toISOString().slice(0, 10),
    }
    localStaff = [next, ...localStaff]
    return next
  }
}

export async function updateReceptionist(
  id: string | number,
  payload: Partial<ReceptionistPayload>,
): Promise<Receptionist> {
  try {
    const { data } = await api.put(`/users/${id}`, payload, { timeout: 2000 })
    const normalized = normalizeUsers([data?.data || data])[0]
    localStaff = localStaff.map((s) => (String(s.id) === String(id) ? normalized : s))
    return normalized
  } catch {
    localStaff = localStaff.map((s) =>
      String(s.id) === String(id)
        ? {
            ...s,
            fullName: payload.fullName ?? s.fullName,
            email: payload.email ?? s.email,
            isActive: payload.isActive ?? s.isActive,
          }
        : s,
    )
    const updated = localStaff.find((s) => String(s.id) === String(id))!
    return updated
  }
}

export async function activateReceptionist(id: string | number): Promise<void> {
  try {
    await api.patch(`/users/${id}/activate`, {}, { timeout: 2000 })
  } catch {
    localStaff = localStaff.map((s) => (String(s.id) === String(id) ? { ...s, isActive: true } : s))
  }
}

export async function deactivateReceptionist(id: string | number): Promise<void> {
  try {
    await api.patch(`/users/${id}/deactivate`, {}, { timeout: 2000 })
  } catch {
    localStaff = localStaff.map((s) => (String(s.id) === String(id) ? { ...s, isActive: false } : s))
  }
}

export async function deleteReceptionist(id: string | number): Promise<void> {
  try {
    await api.delete(`/users/${id}`, { timeout: 2000 })
  } catch {
    localStaff = localStaff.filter((s) => String(s.id) !== String(id))
  }
}