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
