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

export type NeedsAttentionItem = {
  id: string
  title: string
  detail: string
  severity: 'high' | 'medium' | 'low'
  href: string
}

const RANGE_DATA: Record<
  ReportRange,
  {
    kpis: ReportKpis
    statusMix: StatusMixItem[]
    clinicians: TopClinician[]
  }
> = {
  '7d': {
    kpis: {
      completionRate: 0,
      completedCount: 0,
      appointments: 1,
      noShows: 0,
      cancelled: 0,
      activeDoctors: 1,
      patients: 1,
    },
    statusMix: [
      { label: 'Done', count: 0 },
      { label: 'Scheduled', count: 1 },
      { label: 'Checked In', count: 0 },
      { label: 'Cancelled', count: 0 },
      { label: 'No-show', count: 0 },
    ],
    clinicians: [
      {
        id: '1',
        name: 'dr.dude',
        specialty: 'Pediatrics',
        visits: 1,
        trend: 'STABLE',
      },
    ],
  },
  '30d': {
    kpis: {
      completionRate: 42,
      completedCount: 5,
      appointments: 12,
      noShows: 1,
      cancelled: 2,
      activeDoctors: 1,
      patients: 8,
    },
    statusMix: [
      { label: 'Done', count: 5 },
      { label: 'Scheduled', count: 4 },
      { label: 'Checked In', count: 1 },
      { label: 'Cancelled', count: 2 },
      { label: 'No-show', count: 1 },
    ],
    clinicians: [
      {
        id: '1',
        name: 'dr.dude',
        specialty: 'Pediatrics',
        visits: 7,
        trend: 'UP',
      },
    ],
  },
  '90d': {
    kpis: {
      completionRate: 58,
      completedCount: 18,
      appointments: 31,
      noShows: 3,
      cancelled: 4,
      activeDoctors: 2,
      patients: 20,
    },
    statusMix: [
      { label: 'Done', count: 18 },
      { label: 'Scheduled', count: 6 },
      { label: 'Checked In', count: 0 },
      { label: 'Cancelled', count: 4 },
      { label: 'No-show', count: 3 },
    ],
    clinicians: [
      {
        id: '1',
        name: 'dr.dude',
        specialty: 'Pediatrics',
        visits: 19,
        trend: 'UP',
      },
      {
        id: '2',
        name: 'dr.hale',
        specialty: 'General',
        visits: 12,
        trend: 'STABLE',
      },
    ],
  },
}

export const mockNeedsAttention: NeedsAttentionItem[] = [
  {
    id: '1',
    title: 'Awaiting check-in',
    detail: 'Bonce Fowles · 11:30 with dr.dude',
    severity: 'high',
    href: '/appointments',
  },
  {
    id: '2',
    title: 'High no-show risk',
    detail: 'Patient with 2+ prior no-shows has a visit tomorrow morning.',
    severity: 'medium',
    href: '/appointments',
  },
  {
    id: '3',
    title: 'Cancelled slot to refill',
    detail: 'Afternoon Pediatrics slot opened after a cancellation.',
    severity: 'low',
    href: '/appointments',
  },
]

export function getReportData(range: ReportRange) {
  return RANGE_DATA[range]
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function buildReportCsv(range: ReportRange) {
  const { kpis, statusMix, clinicians } = getReportData(range)

  const lines = [
    'Section,Label,Value',
    `KPI,Completion rate (%),${kpis.completionRate}`,
    `KPI,Completed count,${kpis.completedCount}`,
    `KPI,Appointments,${kpis.appointments}`,
    `KPI,No-shows,${kpis.noShows}`,
    `KPI,Cancelled,${kpis.cancelled}`,
    `KPI,Active doctors,${kpis.activeDoctors}`,
    `KPI,Patients,${kpis.patients}`,
    ...statusMix.map((item) => `Status,${item.label},${item.count}`),
    ...clinicians.map(
      (doctor) => `Clinician,${doctor.name} (${doctor.specialty}),${doctor.visits}`,
    ),
  ]

  return lines.join('\n')
}
