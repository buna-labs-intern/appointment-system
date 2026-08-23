import { useState } from 'react'
import Receptionists from '@/features/users/Receptionists'
import StaffSchedule from '@/features/schedule/StaffSchedule'

export default function UsersPage() {
  const [tab, setTab] = useState<'staff' | 'schedule'>('staff')

  return (
    <div className="space-y-6">
      <div className="flex gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setTab('staff')}
          className={`border-b-2 pb-3 text-sm font-medium transition ${
            tab === 'staff'
              ? 'border-[#0F5C66] text-[#0F5C66]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Receptionists
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

      {tab === 'staff' ? <Receptionists /> : <StaffSchedule />}
    </div>
  )
}
