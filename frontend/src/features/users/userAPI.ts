import api from '@/services/axios'
import type { Receptionist } from '@/features/users/types'

export type ReceptionistPayload = {
  fullName: string
  email: string
  password?: string
  isActive?: boolean
  role?: 'RECEPTIONIST'
}

export async function getReceptionists(params?: Record<string, unknown>) {
  const { data } = await api.get<Receptionist[]>('/users', { params })
  return data
}

export async function createReceptionist(payload: ReceptionistPayload) {
  const { data } = await api.post<Receptionist>('/users', {
    ...payload,
    role: 'RECEPTIONIST',
  })
  return data
}

export async function updateReceptionist(
  id: string | number,
  payload: Partial<ReceptionistPayload>,
) {
  const { data } = await api.put<Receptionist>(`/users/${id}`, payload)
  return data
}

export async function activateReceptionist(id: string | number) {
  const { data } = await api.patch<Receptionist>(`/users/${id}/activate`)
  return data
}

export async function deactivateReceptionist(id: string | number) {
  const { data } = await api.patch<Receptionist>(`/users/${id}/deactivate`)
  return data
}
export async function deleteReceptionist(id: string | number) {
  await api.delete(`/users/${id}`)
}