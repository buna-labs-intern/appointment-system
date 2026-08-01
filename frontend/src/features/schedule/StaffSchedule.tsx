import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Plus, ShieldCheck, Users } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ShiftForm from '@/features/schedule/shiftForm'
import {
  formatWeekRange,
  getWeekDays,
  mockStaffShifts,
  toDateKey,
} from '@/features/schedule/mockData'
import { SESSION_TIMES, type StaffShift } from '@/features/schedule/types'
import type { ShiftFormValues } from '@/features/schedule/shiftSchema'
import { mockReceptionists } from '@/features/users/mockData'
import { toast } from '@/lib/toastStore'

export default function StaffSchedule() {
  const [anchor, setAnchor] = useState(() => new Date())
  const [shifts, setShifts] = useState<StaffShift[]>(mockStaffShifts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = useMemo(() => getWeekDays(anchor), [anchor])
  const todayKey = toDateKey(new Date())

  const weekShifts = useMemo(() => {
    const keys = new Set(weekDays.map(toDateKey))
    return shifts.filter((s) => keys.has(s.date))
  }, [shifts, weekDays])

  const todayShifts = useMemo(
    () => shifts.filter((s) => s.date === todayKey),
    [shifts, todayKey],
  )

  const staffOptions = mockReceptionists
    .filter((person) => person.isActive)
    .map((person) => ({ id: person.id, fullName: person.fullName }))

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

  const handleCreate = (values: ShiftFormValues) => {
    const person = mockReceptionists.find((r) => r.id === values.receptionistId)
    if (!person) return

    setIsSubmitting(true)
    try {
      const times = SESSION_TIMES[values.session]
      const next: StaffShift = {
        id: crypto.randomUUID(),
        receptionistId: person.id,
        receptionistName: person.fullName,
        date: values.date,
        session: values.session,
        startTime: times.start,
        endTime: times.end,
        location: values.location.trim(),
        status: 'Scheduled',
      }

      setShifts((prev) => [next, ...prev])
      toast.success('Shift added')
      setDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatWeekRange(anchor)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clinic hours: 09:00–12:00 · Lunch 12:00–13:00 · 13:00–17:00
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-lg bg-[#0F5C66] hover:bg-[#0C4B53]"
          >
            <Plus className="h-4 w-4" />
            Manage Shifts
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Shifts This Week
            </CardTitle>
            <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{weekShifts.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Duty Today
            </CardTitle>
            <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{todayShifts.length}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Week Start</CardTitle>
            <div className="rounded-full bg-[#E7F4F4] p-2 text-[#0F5C66]">
              <Clock3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {weekDays[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

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
                      <p className="text-xs text-muted-foreground">No shifts</p>
                    ) : (
                      dayShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="rounded-lg border border-[#D7E8EA] bg-white px-2 py-1.5"
                        >
                          <p className="truncate text-xs font-medium text-foreground">
                            {shift.receptionistName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {shift.startTime} – {shift.endTime}
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
          <CardTitle className="text-base font-semibold">Today&apos;s Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 font-medium">Staff Member</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Schedule</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayShifts.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="No shifts today"
                        description="Use Manage Shifts to add a shift for today."
                      />
                    </td>
                  </tr>
                ) : (
                  todayShifts.map((shift) => (
                    <tr key={shift.id} className="border-b border-border last:border-0">
                      <td className="py-4 font-medium text-foreground">
                        {shift.receptionistName}
                      </td>
                      <td className="py-4 text-muted-foreground">RECEPTIONIST</td>
                      <td className="py-4 text-foreground">
                        {shift.startTime} – {shift.endTime} ({shift.session})
                      </td>
                      <td className="py-4 text-foreground">{shift.location}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {shift.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground">Manage Shifts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assign a receptionist to morning (09:00–12:00) or afternoon (13:00–17:00). Lunch
              12:00–13:00 is not available.
            </p>
            <div className="mt-5">
              <ShiftForm
                staffOptions={staffOptions}
                onSubmit={handleCreate}
                onCancel={() => setDialogOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}