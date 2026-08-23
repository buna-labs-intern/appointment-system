import api from '@/services/axios'

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type Appointment = {
  id: string | number
  patientId: string | number
  patientName: string
  patientPhone: string
  doctorId: string | number
  doctorName: string
  serviceId: string | number
  serviceName: string
  date: string
  startTime: string
  endTime: string
  reason?: string
  notes?: string
  status: AppointmentStatus
}

export type AppointmentPayload = {
  patientId: string | number
  doctorId: string | number
  serviceId: string | number
  date: string
  startTime?: string
  endTime?: string
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
  status?: string
}

function normalizeList(data: unknown): Appointment[] {
  let list: any[] = []
  if (Array.isArray(data)) list = data
  else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    list = (data as any).data
  }
  return list.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    patientName: item.patientName || item.patient?.fullName || `Patient #${item.patientId}`,
    patientPhone: item.patientPhone || item.patient?.phone || '—',
    doctorId: item.doctorId,
    doctorName: item.doctorName || item.doctor?.fullName || `Doctor #${item.doctorId}`,
    serviceId: item.serviceId,
    serviceName: item.serviceName || item.service?.name || `Service #${item.serviceId}`,
    date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : new Date(item.date).toISOString().split('T')[0]) : '',
    startTime: item.startTime || (item.date ? new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00'),
    endTime: item.endTime || '09:30',
    reason: item.reason || undefined,
    notes: item.notes || undefined,
    status: item.status || 'SCHEDULED',
  }))
}

export async function getAppointments(
  params?: AppointmentListParams,
): Promise<Appointment[]> {
  try {
    const { data } = await api.get('/appointments', { params })
    return normalizeList(data)
  } catch {
    return []
  }
}

export async function getAppointment(id: string | number): Promise<Appointment | null> {
  try {
    const { data } = await api.get(`/appointments/${id}`)
    const normalized = normalizeList([data])
    return normalized[0] ?? null
  } catch {
    return null
  }
}

export async function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const { data } = await api.post('/appointments', payload)
  const normalized = normalizeList([data?.data || data])
  return normalized[0]
}

export async function updateAppointment(
  id: string | number,
  payload: Partial<AppointmentPayload>,
): Promise<Appointment> {
  const { data } = await api.put(`/appointments/${id}`, payload)
  const normalized = normalizeList([data?.data || data])
  return normalized[0]
}

export async function cancelAppointment(id: string | number): Promise<void> {
  await api.patch(`/appointments/${id}/cancel`, {})
}

export async function checkInAppointment(id: string | number): Promise<void> {
  await api.patch(`/appointments/${id}/check-in`, {})
}

export async function completeAppointment(id: string | number): Promise<void> {
  await api.patch(`/appointments/${id}/complete`, {})
}
