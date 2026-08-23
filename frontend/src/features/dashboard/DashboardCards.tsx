import { CalendarDays, Stethoscope, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/features/dashboard/mockData'

type DashboardCardsProps = {
  stats: DashboardStats
}

export default function DashboardCards({ stats }: DashboardCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Doctors
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <Stethoscope className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.totalDoctors}</p>
          <p className="mt-1 text-sm text-emerald-600">{stats.activeDoctors} active</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Patients
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.totalPatients}</p>
          <p className="mt-1 text-sm text-emerald-600">{stats.activePatients} active</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today&apos;s Appointments
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <CalendarDays className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.todaysAppointments}</p>
          <p className="mt-1 text-sm text-muted-foreground">Scheduled</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Appointment Status
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <CalendarDays className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>0 Completed</span>
              <span className="text-muted-foreground">{stats.completedPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#0F5C66]"
                style={{ width: `${stats.completedPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>0 Cancelled</span>
              <span className="text-muted-foreground">{stats.cancelledPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#0F5C66]"
                style={{ width: `${stats.cancelledPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}