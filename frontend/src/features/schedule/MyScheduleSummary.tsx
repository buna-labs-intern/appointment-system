import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getShifts } from '@/features/schedule/scheduleAPI'
import { toDateKey } from '@/features/schedule/scheduleUtils'
import useAuth from '@/hooks/useAuth'

export default function MyScheduleSummary() {
  const { user } = useAuth()
  const todayKey = toDateKey(new Date())
  const receptionistId = user?.id ? String(user.id) : undefined

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['my-schedule-summary', receptionistId, todayKey],
    queryFn: () => getShifts({ from: todayKey, to: todayKey, receptionistId }),
    enabled: Boolean(receptionistId),
  })

  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">My schedule</CardTitle>
          <p className="mt-1 text-base font-semibold text-foreground">Today&apos;s shift</p>
        </div>
        <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
          <CalendarClock className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading schedule...</p>
        ) : shifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shift assigned for today.</p>
        ) : (
          shifts.map((shift) => (
            <div key={shift.id} className="rounded-lg border border-[#D7E8EA] bg-[#F3FAFB] px-3 py-2">
              <p className="text-sm font-medium text-foreground">
                {shift.startTime} – {shift.endTime}
              </p>
              <p className="text-xs text-muted-foreground">{shift.location}</p>
            </div>
          ))
        )}
        <Button asChild variant="outline" size="sm" className="w-full rounded-lg">
          <Link to="/my-schedule">
            View full schedule
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
