import api from '@/services/axios'
import { markApiLive } from '@/lib/dataSource'

export type DashboardStats = {
  totalDoctors: number
  activeDoctors: number
  totalPatients: number
  activePatients: number
  todaysAppointments: number
  completedPercent: number
  cancelledPercent: number
  clinicHealthScore: number
}

export type RecentAppointment = {
  id: string
  patientName: string
  doctorName: string
  serviceName: string
  dateTime: string
  status: 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled' | 'No show'
}

export type DashboardData = {
  stats: DashboardStats
  recentAppointments: RecentAppointment[]
}

type BackendDashboard = {
  totalDoctors: number
  totalPatients: number
  todayAppointments: number
  scheduledAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  recentAppointments: unknown[]
}

function formatDashboardDateTime(iso: string) {
  const parsed = new Date(iso)
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  const h = String(parsed.getHours()).padStart(2, '0')
  const min = String(parsed.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function mapDashboardStatus(status: string): RecentAppointment['status'] {
  switch (status) {
    case 'CHECKED_IN':
      return 'Checked In'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'NO_SHOW':
      return 'No show'
    default:
      return 'Scheduled'
  }
}

function normalizeRecentAppointments(raw: unknown[]): RecentAppointment[] {
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null

      const appointment = item as Record<string, unknown>
      const patient = appointment.patient as Record<string, unknown> | undefined
      const doctor = appointment.doctor as Record<string, unknown> | undefined
      const service = appointment.service as Record<string, unknown> | undefined

      return {
        id: String(appointment.id),
        patientName: String(patient?.fullName ?? 'Unknown patient'),
        doctorName: String(doctor?.fullName ?? 'Unknown doctor'),
        serviceName: String(service?.name ?? 'Unknown service'),
        dateTime: formatDashboardDateTime(String(appointment.date ?? '')),
        status: mapDashboardStatus(String(appointment.status ?? 'SCHEDULED')),
      }
    })
    .filter((item): item is RecentAppointment => item !== null)
}

function normalizeDashboardStats(raw: BackendDashboard): DashboardStats {
  const totalTracked =
    raw.scheduledAppointments + raw.completedAppointments + raw.cancelledAppointments
  const completedPercent =
    totalTracked > 0 ? Math.round((raw.completedAppointments / totalTracked) * 100) : 0
  const cancelledPercent =
    totalTracked > 0 ? Math.round((raw.cancelledAppointments / totalTracked) * 100) : 0
  const clinicHealthScore = Math.min(
    100,
    Math.max(0, completedPercent + Math.round(raw.totalDoctors * 5)),
  )

  return {
    totalDoctors: raw.totalDoctors,
    activeDoctors: raw.totalDoctors,
    totalPatients: raw.totalPatients,
    activePatients: raw.totalPatients,
    todaysAppointments: raw.todayAppointments,
    completedPercent,
    cancelledPercent,
    clinicHealthScore,
  }
}

function unwrapDashboard(raw: unknown): BackendDashboard | null {
  if (!raw || typeof raw !== 'object') return null

  const payload = raw as Record<string, unknown>
  const data =
    payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? (payload.data as Record<string, unknown>)
      : payload

  if (typeof data.totalDoctors !== 'number') return null

  return {
    totalDoctors: data.totalDoctors,
    totalPatients: Number(data.totalPatients ?? 0),
    todayAppointments: Number(data.todayAppointments ?? 0),
    scheduledAppointments: Number(data.scheduledAppointments ?? 0),
    completedAppointments: Number(data.completedAppointments ?? 0),
    cancelledAppointments: Number(data.cancelledAppointments ?? 0),
    recentAppointments: Array.isArray(data.recentAppointments) ? data.recentAppointments : [],
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const { data } = await api.get('/dashboard', { timeout: 10000 })
  markApiLive()

  const dashboard = unwrapDashboard(data)
  if (!dashboard) throw new Error('Invalid dashboard response')

  return {
    stats: normalizeDashboardStats(dashboard),
    recentAppointments: normalizeRecentAppointments(dashboard.recentAppointments),
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
