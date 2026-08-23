import { CheckCircle2, Timer, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReceptionistStats } from '@/features/users/types'

type ReceptionistCardsProps = {
  stats: ReceptionistStats
}

export default function ReceptionistCards({ stats }: ReceptionistCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          <p className="mt-1 text-sm text-emerald-600">{stats.active} active</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.activeToday}</p>
          <p className="mt-1 text-sm text-muted-foreground">Steady</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Shift Coverage
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <UserPlus className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.shiftCoveragePercent}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#0F5C66]"
              style={{ width: `${stats.shiftCoveragePercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Onboarding
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <Timer className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.avgOnboardingDays}d</p>
          <p className="mt-1 text-sm text-muted-foreground">Fast</p>
        </CardContent>
      </Card>
    </div>
  )
}