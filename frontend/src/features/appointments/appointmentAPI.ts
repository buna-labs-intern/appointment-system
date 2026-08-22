import api from '@/services/axios'
import { markApiLive } from '@/lib/dataSource'

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type Appointment = {
  id: string
  patientId: string
  patientName: string
  patientPhone: string
  doctorId: string
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
  patientId: string
  doctorId: string
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

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'SCHEDULED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]

function combineDateAndTime(date: string, time: string) {
  return `${date}T${time}:00`
}

function splitDateTime(iso: string) {
  const parsed = new Date(iso)
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  const h = String(parsed.getHours()).padStart(2, '0')
  const min = String(parsed.getMinutes()).padStart(2, '0')

  return {
    date: `${y}-${m}-${day}`,
    startTime: `${h}:${min}`,
  }
}

function addMinutesToTime(time: string, minutes: number) {
  const [hours, mins] = time.split(':').map(Number)
  const total = hours * 60 + mins + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function normalizeAppointment(raw: unknown): Appointment | null {
  if (!raw || typeof raw !== 'object') return null

  const item = raw as Record<string, unknown>
  if (item.data && typeof item.data === 'object' && !Array.isArray(item.data)) {
    return normalizeAppointment(item.data)
  }

  if (typeof item.id !== 'string') return null

  const status = String(item.status ?? 'SCHEDULED')
  if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) return null

  const { date, startTime } = splitDateTime(String(item.date ?? ''))
  const service = item.service as Record<string, unknown> | undefined
  const patient = item.patient as Record<string, unknown> | undefined
  const doctor = item.doctor as Record<string, unknown> | undefined
  const duration = typeof service?.duration === 'number' ? service.duration : 30

  return {
    id: item.id,
    patientId: String(item.patientId ?? patient?.id ?? ''),
    patientName: String(patient?.fullName ?? 'Unknown patient'),
    patientPhone: String(patient?.phone ?? '—'),
    doctorId: String(item.doctorId ?? doctor?.id ?? ''),
    doctorName: String(doctor?.fullName ?? 'Unknown doctor'),
    serviceId: String(item.serviceId ?? service?.id ?? ''),
    serviceName: String(service?.name ?? 'Unknown service'),
    date,
    startTime,
    endTime: addMinutesToTime(startTime, duration),
    status: status as AppointmentStatus,
  }
}

function normalizeList(data: unknown): Appointment[] {
  let items: unknown[] = []

  if (Array.isArray(data)) {
    items = data
  } else if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    items = (data as { data: unknown[] }).data
  }

  return items
    .map(normalizeAppointment)
    .filter((appointment): appointment is Appointment => appointment !== null)
}

function filterAppointmentsBySearch(
  appointments: Appointment[],
  search?: string,
): Appointment[] {
  const q = search?.trim().toLowerCase()
  if (!q) return appointments

  return appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(q) ||
      appointment.patientPhone.toLowerCase().includes(q) ||
      appointment.doctorName.toLowerCase().includes(q) ||
      appointment.serviceName.toLowerCase().includes(q) ||
      appointment.date.includes(q) ||
      appointment.status.toLowerCase().replace('_', ' ').includes(q),
  )
}

function toApiBody(payload: Partial<AppointmentPayload>) {
  const body: Record<string, string> = {}

  if (payload.doctorId) body.doctorId = payload.doctorId
  if (payload.patientId) body.patientId = payload.patientId
  if (payload.serviceId) body.serviceId = payload.serviceId
  if (payload.date && payload.startTime) {
    body.date = combineDateAndTime(payload.date, payload.startTime)
  }

  return body
}

export async function getAppointments(
  params?: AppointmentListParams,
): Promise<Appointment[]> {
  const { data } = await api.get('/appointments', {
    params: { limit: 100 },
    timeout: 10000,
  })
  markApiLive()
  return filterAppointmentsBySearch(normalizeList(data), params?.search)
}

export async function getAppointment(id: string | number): Promise<Appointment | null> {
  const { data } = await api.get(`/appointments/${id}`, { timeout: 10000 })
  return normalizeAppointment(data)
}

export async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const { data } = await api.post('/appointments', toApiBody(payload), { timeout: 10000 })
  const appointment = normalizeAppointment(data)
  if (!appointment) throw new Error('Invalid appointment response')
  return appointment
}

export async function updateAppointment(
  id: string | number,
  payload: Partial<AppointmentPayload>,
): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}`, toApiBody(payload), {
    timeout: 10000,
  })
  const appointment = normalizeAppointment(data)
  if (!appointment) throw new Error('Invalid appointment response')
  return appointment
}

async function patchStatus(id: string | number, action: string): Promise<Appointment> {
  const { data } = await api.patch(`/appointments/${id}/${action}`, {}, { timeout: 10000 })
  const appointment = normalizeAppointment(data)
  if (!appointment) throw new Error('Invalid appointment response')
  return appointment
}

export function checkInAppointment(id: string | number) {
  return patchStatus(id, 'check-in')
}

export function completeAppointment(id: string | number) {
  return patchStatus(id, 'complete')
}

export function cancelAppointment(id: string | number) {
  return patchStatus(id, 'cancel')
}

export function noShowAppointment(id: string | number) {
  return patchStatus(id, 'no-show')
}
