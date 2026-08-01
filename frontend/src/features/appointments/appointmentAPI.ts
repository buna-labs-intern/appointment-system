import api from '@/services/axios'
import { markApiLive, markMockFallback } from '@/lib/dataSource'
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type Appointment = {
  id: number
  patientId: number
  patientName: string
  patientPhone: string
  doctorId: number
  doctorName: string
  serviceId: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  reason?: string
  notes?: string
  status: AppointmentStatus
}

export type AppointmentPayload = {
  patientId: number
  doctorId: number
  serviceId: string
  date: string
  startTime: string
  endTime: string
  reason?: string
  notes?: string
  status?: AppointmentStatus
  patientName?: string
  patientPhone?: string
  doctorName?: string
  serviceName?: string
}

export type AppointmentListParams = {
  search?: string
}

/** In-memory fallback when the backend `/appointments` API is unavailable. */
let mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Hassan Omar',
    patientPhone: '+252 61 444 4444',
    doctorId: 1,
    doctorName: 'Dr. Sara Ahmed',
    serviceId: '1',
    serviceName: 'General Consultation',
    date: '2026-07-30',
    startTime: '09:00',
    endTime: '09:30',
    reason: 'General checkup',
    status: 'SCHEDULED',
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'Fadumo Abdi',
    patientPhone: '+252 61 555 5555',
    doctorId: 2,
    doctorName: 'Dr. Mohamed Ali',
    serviceId: '3',
    serviceName: 'Pediatrics Consultation',
    date: '2026-07-30',
    startTime: '10:00',
    endTime: '10:30',
    status: 'CHECKED_IN',
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Yusuf Ismail',
    patientPhone: '+252 61 666 6666',
    doctorId: 1,
    doctorName: 'Dr. Sara Ahmed',
    serviceId: '2',
    serviceName: 'Follow-up Consultation',
    date: '2026-07-29',
    startTime: '14:00',
    endTime: '14:15',
    notes: 'Follow-up after fever',
    status: 'COMPLETED',
  },
  {
    id: 4,
    patientId: 2,
    patientName: 'Fadumo Abdi',
    patientPhone: '+252 61 555 5555',
    doctorId: 1,
    doctorName: 'Dr. Sara Ahmed',
    serviceId: '5',
    serviceName: 'Blood Pressure Check',
    date: '2026-07-28',
    startTime: '11:00',
    endTime: '11:10',
    status: 'CANCELLED',
  },
]

let nextId = 5

function filterMockAppointments(search?: string) {
  const q = search?.trim().toLowerCase()
  if (!q) return [...mockAppointments]
  return mockAppointments.filter(
    (item) =>
      item.patientName.toLowerCase().includes(q) ||
      item.patientPhone.toLowerCase().includes(q) ||
      item.doctorName.toLowerCase().includes(q) ||
      item.serviceName.toLowerCase().includes(q) ||
      item.date.includes(q) ||
      item.status.toLowerCase().replace('_', ' ').includes(q),
  )
}

function normalizeList(data: unknown): Appointment[] {
  if (Array.isArray(data)) return data as Appointment[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: Appointment[] }).data
  }
  return []
}

export async function getAppointments(
  params?: AppointmentListParams,
): Promise<Appointment[]> {
  try {
    const { data } = await api.get('/appointments', { params, timeout: 1500 })
    markApiLive()
    return normalizeList(data)
  } catch {
    markMockFallback()
    return filterMockAppointments(params?.search)
  }
}

export async function getAppointment(id: string | number): Promise<Appointment | null> {
  try {
    const { data } = await api.get(`/appointments/${id}`, { timeout: 1500 })
    return data
  } catch {
    return mockAppointments.find((item) => item.id === Number(id)) ?? null
  }
}

export async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  try {
    const { data } = await api.post('/appointments', payload, { timeout: 1500 })
    return data
  } catch {
    const appointment: Appointment = {
      id: nextId++,
      patientId: payload.patientId,
      patientName: payload.patientName ?? `Patient #${payload.patientId}`,
      patientPhone: payload.patientPhone ?? '—',
      doctorId: payload.doctorId,
      doctorName: payload.doctorName ?? `Doctor #${payload.doctorId}`,
      serviceId: payload.serviceId,
      serviceName: payload.serviceName ?? `Service #${payload.serviceId}`,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      reason: payload.reason?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      status: payload.status ?? 'SCHEDULED',
    }
    mockAppointments = [appointment, ...mockAppointments]
    return appointment
  }
}

export async function updateAppointment(
  id: string | number,
  payload: Partial<AppointmentPayload>,
): Promise<Appointment> {
  try {
    const { data } = await api.put(`/appointments/${id}`, payload, { timeout: 1500 })
    return data
  } catch {
    const index = mockAppointments.findIndex((item) => item.id === Number(id))
    if (index === -1) throw new Error('Appointment not found')
    const current = mockAppointments[index]
    const updated: Appointment = {
      ...current,
      ...payload,
      patientName: payload.patientName ?? current.patientName,
      patientPhone: payload.patientPhone ?? current.patientPhone,
      doctorName: payload.doctorName ?? current.doctorName,
      serviceName: payload.serviceName ?? current.serviceName,
      reason:
        payload.reason !== undefined ? payload.reason.trim() || undefined : current.reason,
      notes: payload.notes !== undefined ? payload.notes.trim() || undefined : current.notes,
      status: payload.status ?? current.status,
    }
    mockAppointments = [
      ...mockAppointments.slice(0, index),
      updated,
      ...mockAppointments.slice(index + 1),
    ]
    return updated
  }
}
