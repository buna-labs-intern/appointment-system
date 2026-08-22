import api from '@/services/axios'
import { markApiLive } from '@/lib/dataSource'
import type { Service } from '@/features/services/types'

export type ServicePayload = {
  name: string
  description?: string
  price: number
  duration: number
  isActive?: boolean
}

export type ServiceListParams = {
  search?: string
  isActive?: boolean
}

function makeServiceCode(name: string, id: string) {
  const prefix = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return `SRV-${prefix || id.slice(-4).toUpperCase()}`
}

function normalizeService(raw: unknown): Service | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
    return normalizeService(item.data)
  }

  if (typeof item.id !== 'string') return null

  const name = String(item.name ?? '')

  return {
    id: item.id,
    name,
    code: makeServiceCode(name, item.id),
    category: 'General',
    description: 'No description provided.',
    price: Number(item.price ?? 0),
    duration: Number(item.duration ?? 0),
    isActive: Boolean(item.isActive ?? true),
  }
}

function normalizeList(data: unknown): Service[] {
  let items: unknown[] = []

  if (Array.isArray(data)) {
    items = data
  } else if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    items = (data as { data: unknown[] }).data
  }

  return items.map(normalizeService).filter((service): service is Service => service !== null)
}

function filterServicesBySearch(services: Service[], search?: string): Service[] {
  const q = search?.trim().toLowerCase()
  if (!q) return services

  return services.filter(
    (service) =>
      service.name.toLowerCase().includes(q) ||
      service.code.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q),
  )
}

export async function getServices(params?: ServiceListParams): Promise<Service[]> {
  const { data } = await api.get('/services', {
    params: {
      limit: 100,
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
    },
    timeout: 10000,
  })
  markApiLive()
  return filterServicesBySearch(normalizeList(data), params?.search)
}

export async function getService(id: string | number): Promise<Service | null> {
  const { data } = await api.get(`/services/${id}`, { timeout: 10000 })
  return normalizeService(data)
}

export async function createService(payload: ServicePayload): Promise<Service> {
  const { name, price, duration } = payload
  const { data } = await api.post(
    '/services',
    { name, price, duration },
    { timeout: 10000 },
  )
  const service = normalizeService(data)
  if (!service) throw new Error('Invalid service response')

  if (payload.isActive === false) {
    return deactivateService(service.id)
  }

  return service
}

export async function updateService(
  id: string | number,
  payload: Partial<ServicePayload>,
): Promise<Service> {
  const body: Record<string, string | number | boolean> = {}

  if (payload.name !== undefined) body.name = payload.name
  if (payload.price !== undefined) body.price = payload.price
  if (payload.duration !== undefined) body.duration = payload.duration
  if (payload.isActive !== undefined) body.isActive = payload.isActive

  const { data } = await api.put(`/services/${id}`, body, { timeout: 10000 })
  const service = normalizeService(data)
  if (!service) throw new Error('Invalid service response')
  return service
}

export async function activateService(id: string | number): Promise<Service> {
  const { data } = await api.patch(`/services/${id}/activate`, {}, { timeout: 10000 })
  const service = normalizeService(data)
  if (!service) throw new Error('Invalid service response')
  return service
}

export async function deactivateService(id: string | number): Promise<Service> {
  const { data } = await api.patch(`/services/${id}/deactivate`, {}, { timeout: 10000 })
  const service = normalizeService(data)
  if (!service) throw new Error('Invalid service response')
  return service
}

export async function deleteService(id: string | number): Promise<void> {
  await api.delete(`/services/${id}`, { timeout: 10000 })
}
