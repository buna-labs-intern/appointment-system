import api from '@/services/axios'

import { markApiLive } from '@/lib/dataSource'

export type Doctor = {
  id: string
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

function normalizeDoctor(raw: unknown): Doctor | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
    return normalizeDoctor(item.data)
  }

  if (typeof item.id !== 'string') return null

  return {
    id: item.id,
    fullName: String(item.fullName ?? ''),
    specialty: String(item.specialty ?? ''),
    phone: String(item.phone ?? ''),
    isActive: Boolean(item.isActive ?? true),
  }
}

function normalizeList(data: unknown): Doctor[] {
  let items: unknown[] = []

  if (Array.isArray(data)) {
    items = data
  } else if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    items = (data as { data: unknown[] }).data
  }

  return items.map(normalizeDoctor).filter((doctor): doctor is Doctor => doctor !== null)
}

function filterDoctorsBySearch(doctors: Doctor[], search?: string): Doctor[] {
  const q = search?.trim().toLowerCase()
  if (!q) return doctors

  return doctors.filter(
    (doctor) =>
      doctor.fullName.toLowerCase().includes(q) ||
      doctor.specialty.toLowerCase().includes(q) ||
      doctor.phone.toLowerCase().includes(q),
  )
}

/** axios → used by React Query hooks in DoctorList */
export async function getDoctors(params?: DoctorListParams): Promise<Doctor[]> {
  const { data } = await api.get('/doctors', { timeout: 10000 })
  markApiLive()
  return filterDoctorsBySearch(normalizeList(data), params?.search)
}

export async function getDoctor(id: string | number): Promise<Doctor | null> {
  const { data } = await api.get(`/doctors/${id}`, { timeout: 10000 })
  return normalizeDoctor(data)
}

export async function createDoctor(payload: DoctorPayload): Promise<Doctor> {
  const { fullName, specialty, phone } = payload
  const { data } = await api.post('/doctors', { fullName, specialty, phone }, { timeout: 10000 })
  const doctor = normalizeDoctor(data)
  if (!doctor) throw new Error('Invalid doctor response')
  return doctor
}

export async function updateDoctor(
  id: string | number,
  payload: Partial<DoctorPayload>,
): Promise<Doctor> {
  const { data } = await api.put(`/doctors/${id}`, payload, { timeout: 10000 })
  const doctor = normalizeDoctor(data)
  if (!doctor) throw new Error('Invalid doctor response')
  return doctor
}

export async function deleteDoctor(id: string | number): Promise<void> {
  await api.delete(`/doctors/${id}`, { timeout: 10000 })
}
