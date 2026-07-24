import api from '@/services/axios'

export async function getServices(params?: Record<string, unknown>) {
  const { data } = await api.get('/services', { params })
  return data
}

export async function createService(payload: Record<string, unknown>) {
  const { data } = await api.post('/services', payload)
  return data
}

export async function updateService(id: string | number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/services/${id}`, payload)
  return data
}
