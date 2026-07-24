import api from '@/services/axios'

export async function getPatients(params?: Record<string, unknown>) {
  const { data } = await api.get('/patients', { params })
  return data
}

export async function getPatient(id: string | number) {
  const { data } = await api.get(`/patients/${id}`)
  return data
}

export async function createPatient(payload: Record<string, unknown>) {
  const { data } = await api.post('/patients', payload)
  return data
}

export async function updatePatient(id: string | number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/patients/${id}`, payload)
  return data
}
