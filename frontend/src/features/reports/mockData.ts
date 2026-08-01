export type ReportRange = '7d' | '30d' | '90d'

export type ReportKpis = {
  completionRate: number
  completedCount: number
  appointments: number
  noShows: number
  cancelled: number
  activeDoctors: number
  patients: number
}

export type StatusMixItem = {
  label: string
  count: number
}

export type TopClinician = {
  id: string
  name: string
  specialty: string
  visits: number
  trend: 'STABLE' | 'UP' | 'DOWN'
}

export const mockReportKpis: ReportKpis = {
  completionRate: 0,
  completedCount: 0,
  appointments: 1,
  noShows: 0,
  cancelled: 0,
  activeDoctors: 1,
  patients: 1,
}

export const mockStatusMix: StatusMixItem[] = [
  { label: 'Done', count: 0 },
  { label: 'Scheduled', count: 1 },
  { label: 'Checked In', count: 0 },
  { label: 'Cancelled', count: 0 },
  { label: 'No-show', count: 0 },
]

export const mockTopClinicians: TopClinician[] = [
  {
    id: '1',
    name: 'dr.dude',
    specialty: 'Pediatrics',
    visits: 1,
    trend: 'STABLE',
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