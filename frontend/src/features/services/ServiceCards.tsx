import { Activity, CheckCircle2, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ServiceStats } from '@/features/services/types'

type ServiceCardsProps = {
  stats: ServiceStats
}

export default function ServiceCards({ stats }: ServiceCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Services
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <ClipboardList className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          <p className="mt-1 text-sm text-emerald-600">Catalog size</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Services
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{stats.active}</p>
          <p className="mt-1 text-sm text-muted-foreground">{stats.inactive} inactive</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            High Demand Alert
          </CardTitle>
          <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="truncate text-lg font-semibold text-foreground">{stats.topServiceName}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#0F5C66]"
              style={{ width: `${stats.topServiceDemandPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Active services in clinic.</p>
        </CardContent>
      </Card>
    </div>
  )
}