import api from '@/services/axios'

export async function getAppointments(params?: Record<string, unknown>) {
  const { data } = await api.get('/appointments', { params })
  return data
}

export async function getAppointment(id: string | number) {
  const { data } = await api.get(`/appointments/${id}`)
  return data
}

export async function createAppointment(payload: Record<string, unknown>) {
  const { data } = await api.post('/appointments', payload)
  return data
}

export async function updateAppointment(id: string | number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/appointments/${id}`, payload)
  return data
}
