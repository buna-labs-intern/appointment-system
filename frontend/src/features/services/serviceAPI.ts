import api from '@/services/axios'
import type { Service } from '@/features/services/types'

export type ServicePayload = {
  name: string
  description?: string
  price: number
  duration: number
  isActive?: boolean
}

function normalizeServices(data: any): Service[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data
  return []
}

export async function getServices(params?: Record<string, unknown>): Promise<Service[]> {
  try {
    const { data } = await api.get('/services', { params })
    return normalizeServices(data)
  } catch {
    return []
  }
}

export async function createService(payload: ServicePayload): Promise<Service> {
  const { data } = await api.post('/services', payload)
  return data?.data || data
}

export async function updateService(id: string | number, payload: Partial<ServicePayload>): Promise<Service> {
  const { data } = await api.put(`/services/${id}`, payload)
  return data?.data || data
}

export async function activateService(id: string | number): Promise<Service> {
  const { data } = await api.patch(`/services/${id}/activate`)
  return data?.data || data
}

export async function deactivateService(id: string | number): Promise<Service> {
  const { data } = await api.patch(`/services/${id}/deactivate`)
  return data?.data || data
}

export async function deleteService(id: string | number): Promise<void> {
  await api.delete(`/services/${id}`)
}