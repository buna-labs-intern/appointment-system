import api from '@/services/axios'

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER'

export type Patient = {
  id: number
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

/** In-memory fallback when the backend `/patients` API is unavailable. */
let mockPatients: Patient[] = [
  {
    id: 1,
    fullName: 'Hassan Omar',
    phone: '+252 61 444 4444',
    gender: 'MALE',
    dateOfBirth: '1992-04-12',
    address: 'Hargeisa',
    notes: 'Prefers morning appointments',
  },
  {
    id: 2,
    fullName: 'Fadumo Abdi',
    phone: '+252 61 555 5555',
    gender: 'FEMALE',
    dateOfBirth: '1988-11-03',
    address: 'Berbera',
  },
  {
    id: 3,
    fullName: 'Yusuf Ismail',
    phone: '+252 61 666 6666',
    gender: 'MALE',
    dateOfBirth: '2015-07-21',
    notes: 'Pediatric patient',
  },
]

let nextId = 4

function filterMockPatients(search?: string) {
  const q = search?.trim().toLowerCase()
  if (!q) return [...mockPatients]
  return mockPatients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(q) ||
      patient.phone.toLowerCase().includes(q) ||
      (patient.address?.toLowerCase().includes(q) ?? false),
  )
}

function normalizeList(data: unknown): Patient[] {
  if (Array.isArray(data)) return data as Patient[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Patient[] }).data
  }
  return []
}

/** axios → used by React Query hooks in PatientList */
export async function getPatients(params?: PatientListParams): Promise<Patient[]> {
  try {
    const { data } = await api.get('/patients', { params, timeout: 1500 })
    return normalizeList(data)
  } catch {
    return filterMockPatients(params?.search)
  }
}

export async function getPatient(id: string | number): Promise<Patient | null> {
  try {
    const { data } = await api.get(`/patients/${id}`, { timeout: 1500 })
    return data
  } catch {
    return mockPatients.find((patient) => patient.id === Number(id)) ?? null
  }
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  try {
    const { data } = await api.post('/patients', payload, { timeout: 1500 })
    return data
  } catch {
    const patient: Patient = {
      id: nextId++,
      ...payload,
      address: payload.address?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
    }
    mockPatients = [patient, ...mockPatients]
    return patient
  }
}

export async function updatePatient(
  id: string | number,
  payload: Partial<PatientPayload>,
): Promise<Patient> {
  try {
    const { data } = await api.put(`/patients/${id}`, payload, { timeout: 1500 })
    return data
  } catch {
    const index = mockPatients.findIndex((patient) => patient.id === Number(id))
    if (index === -1) throw new Error('Patient not found')
    const updated: Patient = {
      ...mockPatients[index],
      ...payload,
      address:
        payload.address !== undefined
          ? payload.address.trim() || undefined
          : mockPatients[index].address,
      notes:
        payload.notes !== undefined
          ? payload.notes.trim() || undefined
          : mockPatients[index].notes,
    }
    mockPatients = [...mockPatients.slice(0, index), updated, ...mockPatients.slice(index + 1)]
    return updated
  }
}
