import api from '@/services/axios'
import type { Service } from '@/features/services/types'

export type ServicePayload = {
  name: string
  description?: string
  price: number
  duration: number
  isActive?: boolean
}

export async function getServices(params?: Record<string, unknown>) {
  const { data } = await api.get<Service[]>('/services', { params })
  return data
}

export async function createService(payload: ServicePayload) {
  const { data } = await api.post<Service>('/services', payload)
  return data
}

export async function updateService(id: string | number, payload: Partial<ServicePayload>) {
  const { data } = await api.put<Service>(`/services/${id}`, payload)
  return data
}

export async function activateService(id: string | number) {
  const { data } = await api.patch<Service>(`/services/${id}/activate`)
  return data
}

export async function deactivateService(id: string | number) {
  const { data } = await api.patch<Service>(`/services/${id}/deactivate`)
  return data
}