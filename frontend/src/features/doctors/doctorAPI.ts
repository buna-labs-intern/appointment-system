import api from '@/services/axios'

import { markApiLive, markMockFallback } from '@/lib/dataSource'
export type Doctor = {
  id: number
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

/** In-memory fallback when the backend `/doctors` API is unavailable. */
let mockDoctors: Doctor[] = [
  {
    id: 1,
    fullName: 'Dr. Sara Ahmed',
    specialty: 'General Practice',
    phone: '+252 61 111 1111',
    isActive: true,
  },
  {
    id: 2,
    fullName: 'Dr. Mohamed Ali',
    specialty: 'Pediatrics',
    phone: '+252 61 222 2222',
    isActive: true,
  },
  {
    id: 3,
    fullName: 'Dr. Amina Yusuf',
    specialty: 'Dermatology',
    phone: '+252 61 333 3333',
    isActive: false,
  },
]

let nextId = 4

function filterMockDoctors(search?: string) {
  const q = search?.trim().toLowerCase()
  if (!q) return [...mockDoctors]
  return mockDoctors.filter(
    (doctor) =>
      doctor.fullName.toLowerCase().includes(q) ||
      doctor.specialty.toLowerCase().includes(q) ||
      doctor.phone.toLowerCase().includes(q),
  )
}

function normalizeList(data: unknown): Doctor[] {
  if (Array.isArray(data)) return data as Doctor[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Doctor[] }).data
  }
  return []
}

/** axios → used by React Query hooks in DoctorList */
export async function getDoctors(params?: DoctorListParams): Promise<Doctor[]> {
  try {
    const { data } = await api.get('/doctors', { params, timeout: 1500 })
    markApiLive()
    return normalizeList(data)
  } catch {
    markMockFallback()
    return filterMockDoctors(params?.search)
  }
}

export async function getDoctor(id: string | number): Promise<Doctor | null> {
  try {
    const { data } = await api.get(`/doctors/${id}`, { timeout: 1500 })
    return data
  } catch {
    return mockDoctors.find((doctor) => doctor.id === Number(id)) ?? null
  }
}

export async function createDoctor(payload: DoctorPayload): Promise<Doctor> {
  try {
    const { data } = await api.post('/doctors', payload, { timeout: 1500 })
    return data
  } catch {
    const doctor: Doctor = { id: nextId++, ...payload }
    mockDoctors = [doctor, ...mockDoctors]
    return doctor
  }
}

export async function updateDoctor(
  id: string | number,
  payload: Partial<DoctorPayload>,
): Promise<Doctor> {
  try {
    const { data } = await api.put(`/doctors/${id}`, payload, { timeout: 1500 })
    return data
  } catch {
    const index = mockDoctors.findIndex((doctor) => doctor.id === Number(id))
    if (index === -1) throw new Error('Doctor not found')
    const updated = { ...mockDoctors[index], ...payload }
    mockDoctors = [...mockDoctors.slice(0, index), updated, ...mockDoctors.slice(index + 1)]
    return updated
  }
}

export async function deleteDoctor(id: string | number): Promise<void> {
  try {
    await api.delete(`/doctors/${id}`, { timeout: 1500 })
  } catch {
    const index = mockDoctors.findIndex((doctor) => doctor.id === Number(id))
    if (index === -1) throw new Error('Doctor not found')
    mockDoctors = [...mockDoctors.slice(0, index), ...mockDoctors.slice(index + 1)]
  }
}