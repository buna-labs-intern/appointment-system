import api from '@/services/axios'

export async function getDoctors(params?: Record<string, unknown>) {
  const { data } = await api.get('/doctors', { params })
  return data
}

export async function getDoctor(id: string | number) {
  const { data } = await api.get(`/doctors/${id}`)
  return data
}

export async function createDoctor(payload: Record<string, unknown>) {
  const { data } = await api.post('/doctors', payload)
  return data
}

export async function updateDoctor(id: string | number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/doctors/${id}`, payload)
  return data
}
