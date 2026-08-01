import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Activity,
  CalendarDays,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getInitials,
  mockReportKpis,
  mockStatusMix,
  mockTopClinicians,
  type ReportRange,
} from '@/features/reports/mockData'

const RANGE_LABELS: Record<ReportRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

export default function ReportsOverview() {
  const [range, setRange] = useState<ReportRange>('30d')
  const maxStatus = useMemo(
    () => Math.max(...mockStatusMix.map((item) => item.count), 1),
    [],
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live performance from your NexaCare clinic data.
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

          <Button type="button" variant="outline" className="rounded-lg">
            <Download className="h-4 w-4" />
            Export report
          </Button>
          <Button type="button" className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Completion rate"
          value={`${mockReportKpis.completionRate}%`}
          hint={`${mockReportKpis.completedCount} completed`}
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          title="Appointments"
          value={String(mockReportKpis.appointments)}
          hint={RANGE_LABELS[range].replace('Last ', '') + ' window'}
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <KpiCard
          title="No-shows"
          value={String(mockReportKpis.noShows)}
          hint={`${mockReportKpis.cancelled} cancelled`}
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <KpiCard
          title="Active doctors"
          value={String(mockReportKpis.activeDoctors)}
          hint={`${mockReportKpis.patients} patients`}
          icon={<Stethoscope className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Status mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3 sm:gap-5">
              {mockStatusMix.map((item) => {
                const height = Math.max((item.count / maxStatus) * 100, item.count > 0 ? 18 : 6)

                return (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-foreground">{item.count}</span>
                    <div className="flex h-36 w-full items-end rounded-md bg-muted/50 px-1.5 pb-1.5">
                      <div
                        className="w-full rounded-md bg-[#0F5C66]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-center text-[11px] text-muted-foreground">
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
            <CardTitle className="text-base font-semibold">Top clinicians</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTopClinicians.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No clinician activity yet.
              </p>
            ) : (
              mockTopClinicians.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                    {getInitials(doctor.name) || 'D'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialty} · {doctor.visits} visits
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {doctor.trend}
                  </span>
                </div>
              ))
            )}

            <Link
              to="/doctors"
              className="inline-flex pt-1 text-sm font-medium text-[#0F5C66] hover:underline"
            >
              Manage doctors
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NexaCare Health Systems — mock report data until APIs are
        connected.
      </p>
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