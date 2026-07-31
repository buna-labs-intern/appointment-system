import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockDashboardStats, mockRecentAppointments } from '@/features/dashboard/mockData'

export default function ReportsOverview() {
  const scheduled = mockRecentAppointments.filter((item) => item.status === 'Scheduled').length
  const completed = mockRecentAppointments.filter((item) => item.status === 'Completed').length
  const cancelled = mockRecentAppointments.filter((item) => item.status === 'Cancelled').length

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Reports & Analytics</h3>
        <p className="text-sm text-muted-foreground">
          High-level clinic activity for administrators.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Doctors" value={mockDashboardStats.totalDoctors} hint={`${mockDashboardStats.activeDoctors} active`} />
        <StatCard title="Patients" value={mockDashboardStats.totalPatients} hint={`${mockDashboardStats.activePatients} active`} />
        <StatCard title="Today" value={mockDashboardStats.todaysAppointments} hint="Appointments" />
        <StatCard title="Health score" value={mockDashboardStats.clinicHealthScore} hint="/ 100" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard title="Scheduled (sample)" value={scheduled} hint="Recent list" />
        <StatCard title="Completed (sample)" value={completed} hint={`${mockDashboardStats.completedPercent}% overall`} />
        <StatCard title="Cancelled (sample)" value={cancelled} hint={`${mockDashboardStats.cancelledPercent}% overall`} />
      </div>
    </section>
  )
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string
  value: number
  hint: string
}) {
  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
