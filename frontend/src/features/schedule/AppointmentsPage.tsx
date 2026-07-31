import { useState } from 'react'
import AppointmentList from '@/features/appointments/AppointmentList'
import StaffSchedule from '@/features/schedule/StaffSchedule'

export default function AppointmentsPage() {
  const [tab, setTab] = useState<'list' | 'schedule'>('list')

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab('list')}
          className={`border-b-2 pb-3 text-sm font-medium transition ${
            tab === 'list'
              ? 'border-[#0F5C66] text-[#0F5C66]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Appointments List
        </button>
        <button
          type="button"
          onClick={() => setTab('schedule')}
          className={`border-b-2 pb-3 text-sm font-medium transition ${
            tab === 'schedule'
              ? 'border-[#0F5C66] text-[#0F5C66]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Staff Schedule
        </button>
      </div>

      {tab === 'list' ? <AppointmentList /> : <StaffSchedule />}
    </div>
  )
}