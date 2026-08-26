import api from '@/services/axios'
import type { ShiftSession, StaffShift } from '@/features/schedule/types'

export type ShiftPayload = {
  receptionistId: string
  date: string
  session: ShiftSession
  location?: string
}

function mapStatus(status: string): StaffShift['status'] {
  switch (status) {
    case 'ON_DUTY':
      return 'On Duty'
    case 'COMPLETED':
      return 'Completed'
    default:
      return 'Scheduled'
  }
}

function normalizeShift(raw: any): StaffShift | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data) ? raw.data : raw
  if (!item.id) return null

  const dateValue = item.date
    ? typeof item.date === 'string'
      ? item.date.slice(0, 10)
      : new Date(item.date).toISOString().slice(0, 10)
    : ''

  return {
    id: String(item.id),
    receptionistId: String(item.receptionistId || item.receptionist?.id || ''),
    receptionistName: String(item.receptionist?.fullName || item.receptionistName || 'Staff'),
    date: dateValue,
    session: (item.session === 'AFTERNOON' ? 'AFTERNOON' : 'MORNING') as ShiftSession,
    startTime: String(item.startTime || '09:00'),
    endTime: String(item.endTime || '12:00'),
    location: String(item.location || 'Front Desk'),
    status: mapStatus(String(item.status || 'SCHEDULED')),
  }
}

function normalizeList(data: unknown): StaffShift[] {
  let list: any[] = []
  if (Array.isArray(data)) list = data
  else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    list = (data as any).data
  }
  return list.map(normalizeShift).filter((s): s is StaffShift => s !== null)
}

export async function getShifts(params?: {
  from?: string
  to?: string
  receptionistId?: string
}): Promise<StaffShift[]> {
  const { data } = await api.get('/schedule', { params })
  return normalizeList(data)
}

export async function createShift(payload: ShiftPayload): Promise<StaffShift> {
  const { data } = await api.post('/schedule', payload)
  const shift = normalizeShift(data?.data ?? data)
  if (!shift) throw new Error('Invalid shift response')
  return shift
}

export async function updateShift(
  id: string,
  payload: Partial<ShiftPayload> & { status?: 'SCHEDULED' | 'ON_DUTY' | 'COMPLETED' },
): Promise<StaffShift> {
  const { data } = await api.patch(`/schedule/${id}`, payload)
  const shift = normalizeShift(data?.data ?? data)
  if (!shift) throw new Error('Invalid shift response')
  return shift
}

export async function deleteShift(id: string): Promise<void> {
  await api.delete(`/schedule/${id}`)
}
