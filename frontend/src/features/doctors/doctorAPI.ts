import api from '@/services/axios'

export type Doctor = {
  id: string | number
  fullName: string
  specialty: string
  phone: string
  isActive: boolean
}

export type DoctorPayload = {
  fullName: string
  specialty: string
  phone: string
  isActive: boolean
}

export type DoctorListParams = {
  search?: string
}

function normalizeList(data: unknown): Doctor[] {
  if (Array.isArray(data)) return data as Doctor[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Doctor[] }).data
  }
  return []
}

export async function getDoctors(params?: DoctorListParams): Promise<Doctor[]> {
  try {
    const { data } = await api.get('/doctors', { params })
    return normalizeList(data)
  } catch {
    return []
  }
}

export async function getDoctor(id: string | number): Promise<Doctor | null> {
  try {
    const { data } = await api.get(`/doctors/${id}`)
    return data?.data || data
  } catch {
    return null
  }
}

export async function createDoctor(payload: DoctorPayload): Promise<Doctor> {
  const { data } = await api.post('/doctors', payload)
  return data?.data || data
}

export async function updateDoctor(
  id: string | number,
  payload: Partial<DoctorPayload>,
): Promise<Doctor> {
  const { data } = await api.put(`/doctors/${id}`, payload)
  return data?.data || data
}

export async function deleteDoctor(id: string | number): Promise<void> {
  await api.delete(`/doctors/${id}`)
}