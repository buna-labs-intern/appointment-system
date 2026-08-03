export type ShiftSession = 'MORNING' | 'AFTERNOON'

export type StaffShift = {
  id: string
  receptionistId: string
  receptionistName: string
  date: string
  session: ShiftSession
  startTime: string
  endTime: string
  location: string
  status: 'Scheduled' | 'On Duty' | 'Completed'
}

export const CLINIC_HOURS = {
  morning: { start: '09:00', end: '12:00' },
  lunch: { start: '12:00', end: '13:00' },
  afternoon: { start: '13:00', end: '17:00' },
} as const

export const SESSION_TIMES: Record<ShiftSession, { start: string; end: string; label: string }> = {
  MORNING: { start: '09:00', end: '12:00', label: 'Morning (09:00 – 12:00)' },
  AFTERNOON: { start: '13:00', end: '17:00', label: 'Afternoon (13:00 – 17:00)' },
}