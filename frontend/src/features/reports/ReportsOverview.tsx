import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  ShieldAlert,
  Stethoscope,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingState from '@/components/common/LoadingState'
import { getAppointments, type Appointment } from '@/features/appointments/appointmentAPI'
import { getDoctors, type Doctor } from '@/features/doctors/doctorAPI'
import { getPatients } from '@/features/patients/patientAPI'
import { getInitials } from '@/features/dashboard/mockData'

export type ReportRange = '7d' | '30d' | '90d'

const RANGE_LABELS: Record<ReportRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

const RANGE_DAYS: Record<ReportRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

export default function ReportsOverview() {
  const [range, setRange] = useState<ReportRange>('30d')

  const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
    queryKey: ['appointments', 'reports'],
    queryFn: () => getAppointments(),
  })

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors', 'reports'],
    queryFn: () => getDoctors(),
  })

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', 'reports'],
    queryFn: () => getPatients(),
  })

  // Filter appointments within selected range
  const filteredAppointments = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - RANGE_DAYS[range])

    return appointments.filter((appt) => {
      if (!appt.date) return true
      const apptDate = new Date(appt.date)
      return apptDate >= cutoff
    })
  }, [appointments, range])

  // KPIs
  const kpis = useMemo(() => {
    const total = filteredAppointments.length
    const completed = filteredAppointments.filter((a) => a.status === 'COMPLETED').length
    const noShows = filteredAppointments.filter((a) => a.status === 'NO_SHOW').length
    const cancelled = filteredAppointments.filter((a) => a.status === 'CANCELLED').length
    const scheduled = filteredAppointments.filter((a) => a.status === 'SCHEDULED' || a.status === 'CHECKED_IN').length
    const activeDoctors = doctors.filter((d) => d.isActive).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      noShows,
      cancelled,
      scheduled,
      activeDoctors,
      totalPatients: patients.length,
      completionRate,
    }
  }, [filteredAppointments, doctors, patients])

  // Status breakdown
  const statusMix = useMemo(() => {
    const counts = {
      SCHEDULED: 0,
      CHECKED_IN: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0,
    }

    filteredAppointments.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++
      }
    })

    return [
      { label: 'Scheduled', count: counts.SCHEDULED },
      { label: 'Checked in', count: counts.CHECKED_IN },
      { label: 'Completed', count: counts.COMPLETED },
      { label: 'Cancelled', count: counts.CANCELLED },
      { label: 'No-show', count: counts.NO_SHOW },
    ]
  }, [filteredAppointments])

  const maxStatus = useMemo(
    () => Math.max(...statusMix.map((item) => item.count), 1),
    [statusMix],
  )

  // Top clinicians computed from real database appointments
  const topClinicians = useMemo(() => {
    const doctorVisitMap = new Map<string, { doctor: Doctor; count: number }>()

    doctors.forEach((doc) => {
      doctorVisitMap.set(String(doc.id), { doctor: doc, count: 0 })
    })

    filteredAppointments.forEach((appt) => {
      const docId = String(appt.doctorId)
      if (doctorVisitMap.has(docId)) {
        doctorVisitMap.get(docId)!.count++
      }
    })

    const list = Array.from(doctorVisitMap.values())
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return list
  }, [filteredAppointments, doctors])

  // Real items needing attention (e.g. recent no-shows or overdue visits)
  const needsAttention = useMemo(() => {
    const items: Array<{
      id: string
      title: string
      detail: string
      severity: 'high' | 'medium' | 'low'
      href: string
    }> = []

    const todayStr = new Date().toISOString().split('T')[0]
    const todayScheduled = appointments.filter(
      (a) => a.date === todayStr && a.status === 'SCHEDULED',
    )

    if (todayScheduled.length > 0) {
      items.push({
        id: 'pending-today',
        title: `${todayScheduled.length} appointments pending check-in today`,
        detail: `Patients scheduled for today who have not yet checked in.`,
        severity: 'medium',
        href: '/appointments',
      })
    }

    const recentNoShows = appointments.filter((a) => a.status === 'NO_SHOW').slice(0, 3)
    recentNoShows.forEach((ns) => {
      items.push({
        id: `ns-${ns.id}`,
        title: `No-show recorded: ${ns.patientName}`,
        detail: `Missed visit with ${ns.doctorName} on ${ns.date}. Consider follow-up.`,
        severity: 'high',
        href: '/appointments',
      })
    })

    return items
  }, [appointments])

  function handleExportCsv() {
    const headers = [
      'Appointment ID',
      'Patient Name',
      'Doctor Name',
      'Service',
      'Date',
      'Start Time',
      'End Time',
      'Status',
      'Reason',
    ]

    const rows = filteredAppointments.map((a) => [
      `"${a.id}"`,
      `"${a.patientName}"`,
      `"${a.doctorName}"`,
      `"${a.serviceName}"`,
      `"${a.date}"`,
      `"${a.startTime}"`,
      `"${a.endTime}"`,
      `"${a.status}"`,
      `"${a.reason || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nexacare-clinic-report-${range}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loadingAppointments || loadingDoctors) {
    return (
      <div className="py-12">
        <LoadingState label="Loading operations analytics from database..." />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Operations &amp; Reports Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live clinic performance metrics and analytics for administrators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as ReportRange)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="7d">{RANGE_LABELS['7d']}</option>
            <option value="30d">{RANGE_LABELS['30d']}</option>
            <option value="90d">{RANGE_LABELS['90d']}</option>
          </select>

          <Button
            type="button"
            onClick={handleExportCsv}
            className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53] gap-1.5"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Completion rate"
          value={`${kpis.completionRate}%`}
          hint={`${kpis.completed} completed visits`}
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          title="Total Appointments"
          value={String(kpis.total)}
          hint={`${RANGE_LABELS[range]} window`}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <KpiCard
          title="No-shows"
          value={String(kpis.noShows)}
          hint={`${kpis.cancelled} cancelled`}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <KpiCard
          title="Active Doctors"
          value={String(kpis.activeDoctors)}
          hint={`${kpis.totalPatients} registered patients`}
          icon={<Stethoscope className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Appointment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3 sm:gap-5">
              {statusMix.map((item) => {
                const height = Math.max(
                  (item.count / maxStatus) * 100,
                  item.count > 0 ? 18 : 6,
                )

                return (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{item.count}</span>
                    <div className="flex h-36 w-full items-end rounded-md bg-muted/50 px-1.5 pb-1.5">
                      <div
                        className="w-full rounded-md bg-[#0F5C66] transition-all duration-300"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-center text-[11px] text-muted-foreground font-medium">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Clinicians</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClinicians.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No clinician activity recorded in this period.
              </p>
            ) : (
              topClinicians.map(({ doctor, count }) => (
                <div
                  key={doctor.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7F4F4] text-sm font-semibold text-[#0F5C66]">
                    {getInitials(doctor.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{doctor.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialty} · {count} visit{count === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              ))
            )}

            <Link
              to="/doctors"
              className="inline-flex pt-1 text-sm font-medium text-[#0F5C66] hover:underline"
            >
              Manage doctors →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Operational Alerts &amp; Attention</CardTitle>
          {needsAttention.length > 0 ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              {needsAttention.length} active
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              All normal
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {needsAttention.length === 0 ? (
            <div className="flex items-center gap-2.5 py-4 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">No pending alerts. Clinic is operating smoothly!</p>
            </div>
          ) : (
            needsAttention.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={`block rounded-lg border-l-4 px-4 py-3 transition hover:opacity-90 ${
                  item.severity === 'high'
                    ? 'border-l-rose-500 bg-rose-50/70'
                    : 'border-l-amber-500 bg-amber-50/70'
                }`}
              >
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </Link>
            ))
          )}
          <Link
            to="/appointments"
            className="inline-flex pt-1 text-sm font-medium text-[#0F5C66] hover:underline"
          >
            View all appointments →
          </Link>
        </CardContent>
      </Card>
    </section>
  )
}

function KpiCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string
  value: string
  hint: string
  icon: React.ReactNode
}) {
  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
