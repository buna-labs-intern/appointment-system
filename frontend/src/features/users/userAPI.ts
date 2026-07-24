import api from '@/services/axios'

export async function getReceptionists(params?: Record<string, unknown>) {
  const { data } = await api.get('/users', { params })
  return data
}

export async function createReceptionist(payload: Record<string, unknown>) {
  const { data } = await api.post('/users', payload)
  return data
}

export async function updateReceptionist(id: string | number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}
