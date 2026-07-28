import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAuth from '@/hooks/useAuth'
import DashboardCards from '@/features/dashboard/DashboardCards'
import RecentAppointments from '@/features/dashboard/RecentAppointments'
import {
  mockDashboardStats,
  mockRecentAppointments,
  mockUrgentTasks,
} from '@/features/dashboard/mockData'

export default function DashboardOverview() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || 'User'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {displayName}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Button asChild className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
          <Link to="/appointments">
            <Plus className="h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <DashboardCards stats={mockDashboardStats} />

      <RecentAppointments appointments={mockRecentAppointments} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Urgent Tasks</CardTitle>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
              {mockUrgentTasks.length} pending
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockUrgentTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border-l-4 border-[#3482B5] bg-sky-50/70 px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{task.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-0 bg-[#0F5C66] text-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white">
              Clinic Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {mockDashboardStats.clinicHealthScore}{' '}
              <span className="text-2xl font-semibold text-white/80">/ 100</span>
            </p>
            <p className="mt-3 text-sm text-white/80">
              Based on appointment completion rate and active staff coverage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}