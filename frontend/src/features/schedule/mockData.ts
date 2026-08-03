import type { StaffShift } from '@/features/schedule/types'

export const mockStaffShifts: StaffShift[] = [
  {
    id: '1',
    receptionistId: '1',
    receptionistName: 'dule cumbe',
    date: '2026-07-31',
    session: 'MORNING',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Front Desk',
    status: 'Scheduled',
  },
  {
    id: '2',
    receptionistId: '2',
    receptionistName: 'Sara Ali',
    date: '2026-07-31',
    session: 'AFTERNOON',
    startTime: '13:00',
    endTime: '17:00',
    location: 'Front Desk',
    status: 'Scheduled',
  },
]

export function formatWeekRange(anchor: Date) {
  const start = startOfWeek(anchor)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return `${fmt(start)} – ${fmt(end)}`
}

export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekDays(anchor: Date) {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function toDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}