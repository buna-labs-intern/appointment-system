import api from '@/services/axios'

export type PatientGender = 'MALE' | 'FEMALE'

export type Patient = {
  id: string | number
  fullName: string
  phone: string
  gender: PatientGender
  dateOfBirth: string
  address?: string
  notes?: string
}

export type PatientPayload = {
  fullName: string
  phone: string
  gender: PatientGender
  dateOfBirth: string
  address?: string
  notes?: string
}

export type PatientListParams = {
  search?: string
}

function normalizeList(data: unknown): Patient[] {
  let list: any[] = []
  if (Array.isArray(data)) list = data
  else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    list = (data as any).data
  }
  return list.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    phone: p.phone,
    gender: (p.gender?.toUpperCase() || 'MALE') as PatientGender,
    dateOfBirth: p.dateOfBirth || (p.birthDate ? (typeof p.birthDate === 'string' ? p.birthDate.split('T')[0] : new Date(p.birthDate).toISOString().split('T')[0]) : '1990-01-01'),
    address: p.address || undefined,
    notes: p.notes || undefined,
  }))
}

export async function getPatients(params?: PatientListParams): Promise<Patient[]> {
  try {
    const { data } = await api.get('/patients', { params })
    return normalizeList(data)
  } catch {
    return []
  }
}

export async function getPatient(id: string | number): Promise<Patient | null> {
  try {
    const { data } = await api.get(`/patients/${id}`)
    const normalized = normalizeList([data?.data || data])
    return normalized[0] ?? null
  } catch {
    return null
  }
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const { data } = await api.post('/patients', {
    ...payload,
    birthDate: payload.dateOfBirth,
  })
  const normalized = normalizeList([data?.data || data])
  return normalized[0]
}

export async function updatePatient(
  id: string | number,
  payload: Partial<PatientPayload>,
): Promise<Patient> {
  const { data } = await api.put(`/patients/${id}`, {
    ...payload,
    birthDate: payload.dateOfBirth,
  })
  const normalized = normalizeList([data?.data || data])
  return normalized[0]
}

export async function deletePatient(id: string | number): Promise<void> {
  await api.delete(`/patients/${id}`)
}