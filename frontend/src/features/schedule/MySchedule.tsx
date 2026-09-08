import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import EmptyState from '@/components/common/EmptyState'
import LoadingState from '@/components/common/LoadingState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getShifts } from '@/features/schedule/scheduleAPI'
import {
  formatWeekRange,
  getWeekDays,
  toDateKey,
} from '@/features/schedule/scheduleUtils'
import { SESSION_TIMES } from '@/features/schedule/types'
import useAuth from '@/hooks/useAuth'

export default function MySchedule() {
  const { user } = useAuth()
  const [anchor, setAnchor] = useState(() => new Date())

  const weekDays = useMemo(() => getWeekDays(anchor), [anchor])
  const todayKey = toDateKey(new Date())
  const from = toDateKey(weekDays[0])
  const to = toDateKey(weekDays[weekDays.length - 1])
  const receptionistId = user?.id ? String(user.id) : undefined

  const shiftsQuery = useQuery({
    queryKey: ['my-schedule', receptionistId, from, to],
    queryFn: () => getShifts({ from, to, receptionistId }),
    enabled: Boolean(receptionistId),
  })

  const shifts = shiftsQuery.data ?? []

  const weekShifts = useMemo(() => {
    const keys = new Set(weekDays.map(toDateKey))
    return shifts.filter((s) => keys.has(s.date))
  }, [shifts, weekDays])

  const todayShifts = useMemo(
    () => shifts.filter((s) => s.date === todayKey),
    [shifts, todayKey],
  )

  const goPrevWeek = () => {
    const d = new Date(anchor)
    d.setDate(d.getDate() - 7)
    setAnchor(d)
  }

  const goNextWeek = () => {
    const d = new Date(anchor)
    d.setDate(d.getDate() + 7)
    setAnchor(d)
  }

  const goToday = () => setAnchor(new Date())

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatWeekRange(anchor)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clinic hours: 09:00–12:00 · Lunch 12:00–13:00 · 13:00–17:00
          </p>
        </div>

        <div className="inline-flex items-center rounded-lg border border-border bg-white p-1">
          <button
            type="button"
            onClick={goPrevWeek}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNextWeek}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shifts This Week
            </CardTitle>
            <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
              <Clock3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{weekShifts.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Shift
            </CardTitle>
            <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
              <MapPin className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {todayShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shift assigned today</p>
            ) : (
              <div className="space-y-1">
                {todayShifts.map((shift) => (
                  <p key={shift.id} className="text-sm font-medium text-foreground">
                    {shift.startTime} – {shift.endTime} · {shift.location}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {shiftsQuery.isLoading ? (
        <LoadingState label="Loading your schedule..." />
      ) : shiftsQuery.isError ? (
        <EmptyState
          title="Could not load schedule"
          description="Make sure you are logged in and the backend is running."
        />
      ) : (
        <>
          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Weekly schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-7">
                {weekDays.map((day) => {
                  const key = toDateKey(day)
                  const dayShifts = shifts.filter((s) => s.date === key)

                  return (
                    <div
                      key={key}
                      className={`min-h-36 rounded-xl border border-border p-3 ${
                        key === todayKey ? 'bg-[#F3FAFB]' : 'bg-white'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })} {day.getDate()}
                      </p>
                      <div className="mt-3 space-y-2">
                        {dayShifts.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Off</p>
                        ) : (
                          dayShifts.map((shift) => (
                            <div
                              key={shift.id}
                              className="rounded-lg border border-[#D7E8EA] bg-white px-2 py-1.5"
                            >
                              <p className="text-xs font-medium text-foreground">
                                {SESSION_TIMES[shift.session].label}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {shift.location}
                              </p>
                              <p className="mt-1 text-[11px] font-medium text-[#0F5C66]">
                                {shift.status}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Upcoming shifts</CardTitle>
            </CardHeader>
            <CardContent>
              {weekShifts.length === 0 ? (
                <EmptyState
                  title="No shifts this week"
                  description="Your manager has not assigned any shifts for this week yet."
                />
              ) : (
                <div className="space-y-3">
                  {weekShifts
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
                    .map((shift) => (
                      <div
                        key={shift.id}
                        className={`flex flex-col gap-1 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                          shift.date === todayKey ? 'bg-[#F3FAFB]' : 'bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(`${shift.date}T12:00:00`).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {shift.startTime} – {shift.endTime} ({shift.session})
                          </p>
                        </div>
                        <div className="text-sm text-foreground">{shift.location}</div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
