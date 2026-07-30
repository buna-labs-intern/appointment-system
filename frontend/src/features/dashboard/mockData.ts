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
    status: 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled'
  }
  
  export type UrgentTask = {
    id: string
    title: string
    detail: string
  }
  
  export const mockDashboardStats: DashboardStats = {
    totalDoctors: 1,
    activeDoctors: 1,
    totalPatients: 1,
    activePatients: 1,
    todaysAppointments: 1,
    completedPercent: 0,
    cancelledPercent: 0,
    clinicHealthScore: 70,
  }
  
  export const mockRecentAppointments: RecentAppointment[] = [
    {
      id: '1',
      patientName: 'Bonce Fowles',
      doctorName: 'dr.dude',
      serviceName: 'abatu',
      dateTime: '2026-07-24 11:30',
      status: 'Scheduled',
    },
  ]
  
  export const mockUrgentTasks: UrgentTask[] = [
    {
      id: '1',
      title: 'Awaiting check-in',
      detail: 'Bonce Fowles · 11:30 with dr.dude',
    },
  ]
  
  export function getInitials(name: string) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }