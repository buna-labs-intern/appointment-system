import { useMemo } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAuth from '@/hooks/useAuth'
import DashboardCards from '@/features/dashboard/DashboardCards'
import RecentAppointments from '@/features/dashboard/RecentAppointments'
import { getDashboardData } from '@/features/dashboard/dashboardAPI'
import { isAdmin } from '@/utils/permissions'

export default function DashboardOverview() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || 'User'
  const adminView = isAdmin(user?.role)

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: getDashboardData,
    refetchInterval: 15000,
  })

  const stats = dashboardData?.stats
  const recentAppointments = dashboardData?.recentAppointments || []

  // Derive dynamic tasks from real appointments
  const urgentTasks = useMemo(() => {
    const scheduled = recentAppointments.filter(
      (a) => a.status === 'Scheduled' || a.status === 'SCHEDULED',
    )
    if (scheduled.length > 0) {
      return scheduled.slice(0, 3).map((a) => ({
        id: a.id,
        title: `Pending Visit: ${a.patientName}`,
        detail: `Scheduled with ${a.doctorName} for ${a.serviceName} at ${a.dateTime}.`,
      }))
    }
    return []
  }, [recentAppointments])

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
                {stats ? stats.todaysAppointments : 0}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-sm sm:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Front-desk tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentTasks.length === 0 ? (
                <div className="flex items-center gap-2.5 py-4 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">All front-desk tasks are up to date.</p>
                </div>
              ) : (
                urgentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border-l-4 border-[#3482B5] bg-sky-50/70 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.detail}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <RecentAppointments appointments={recentAppointments} />
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

      {stats ? <DashboardCards stats={stats} /> : null}

      <RecentAppointments appointments={recentAppointments} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Pending Appointments</CardTitle>
            {urgentTasks.length > 0 ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                {urgentTasks.length} pending
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                All clear
              </span>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="flex items-center gap-2.5 py-4 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-medium">No pending appointment actions required.</p>
              </div>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border-l-4 border-[#3482B5] bg-sky-50/70 px-4 py-3"
                >
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{task.detail}</p>
                </div>
              ))
            )}
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
              {stats ? stats.clinicHealthScore : 85}{' '}
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
