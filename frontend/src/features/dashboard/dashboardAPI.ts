import api from '@/services/axios'
import type { DashboardStats, RecentAppointment } from './types'

export async function getDashboardData(): Promise<{
  stats: DashboardStats
  recentAppointments: RecentAppointment[]
}> {
  try {
    const { data } = await api.get('/dashboard')
    const raw = data?.data || data

    const totalScheduled = raw.scheduledAppointments || 0
    const totalCompleted = raw.completedAppointments || 0
    const totalCancelled = raw.cancelledAppointments || 0
    const totalAppointments = totalScheduled + totalCompleted + totalCancelled || 1

    const stats: DashboardStats = {
      totalDoctors: raw.totalDoctors ?? 0,
      activeDoctors: raw.totalDoctors ?? 0,
      totalPatients: raw.totalPatients ?? 0,
      activePatients: raw.totalPatients ?? 0,
      todaysAppointments: raw.todayAppointments ?? 0,
      completedPercent: Math.round((totalCompleted / totalAppointments) * 100),
      cancelledPercent: Math.round((totalCancelled / totalAppointments) * 100),
      clinicHealthScore: Math.min(100, Math.max(50, 70 + Math.round((totalCompleted / totalAppointments) * 30))),
    }

    const recentAppointments: RecentAppointment[] = (raw.recentAppointments || []).map((a: any) => ({
      id: String(a.id),
      patientName: a.patient?.fullName || 'Patient',
      doctorName: a.doctor?.fullName || 'Doctor',
      serviceName: a.service?.name || 'Consultation',
      dateTime: a.startTime ? `${new Date(a.date).toLocaleDateString()} ${a.startTime}` : new Date(a.date).toLocaleString(),
      status:
        a.status === 'CHECKED_IN'
          ? 'Checked In'
          : a.status === 'COMPLETED'
          ? 'Completed'
          : a.status === 'CANCELLED'
          ? 'Cancelled'
          : 'Scheduled',
    }))

    return {
      stats,
      recentAppointments,
    }
  } catch {
    return {
      stats: {
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
        activePatients: 0,
        todaysAppointments: 0,
        completedPercent: 0,
        cancelledPercent: 0,
        clinicHealthScore: 80,
      },
      recentAppointments: [],
    }
  }
}
