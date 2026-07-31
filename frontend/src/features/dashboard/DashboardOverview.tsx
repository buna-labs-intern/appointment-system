import { Link } from 'react-router'
import { CalendarDays, Plus, UserPlus } from 'lucide-react'
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
import { isAdmin } from '@/utils/permissions'

export default function DashboardOverview() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || 'User'
  const adminView = isAdmin(user?.role)

  if (!adminView) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reception Desk
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {displayName}. Manage today&apos;s check-ins and bookings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg">
              <Link to="/patients">
                <UserPlus className="h-4 w-4" />
                Register patient
              </Link>
            </Button>
            <Button asChild className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]">
              <Link to="/appointments">
                <Plus className="h-4 w-4" />
                New appointment
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s appointments
              </CardTitle>
              <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
                <CalendarDays className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {mockDashboardStats.todaysAppointments}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Front-desk tasks</CardTitle>
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
        </div>

        <RecentAppointments appointments={mockRecentAppointments} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {displayName}. Clinic overview and operational health.
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
            <Button
              asChild
              variant="secondary"
              className="mt-4 bg-white/15 text-white hover:bg-white/25"
            >
              <Link to="/reports">View reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
