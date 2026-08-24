import { Link } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitials } from '@/utils/text'
import type { RecentAppointment } from '@/features/dashboard/types'

type RecentAppointmentsProps = {
  appointments: RecentAppointment[]
}

const statusStyles: Record<RecentAppointment['status'], string> = {
  Scheduled: 'bg-sky-50 text-sky-700',
  'Checked In': 'bg-amber-50 text-amber-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-rose-50 text-rose-700',
}

export default function RecentAppointments({ appointments }: RecentAppointmentsProps) {
  return (
    <Card className="rounded-xl border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Recent Appointments</CardTitle>
        <Link to="/appointments" className="text-sm font-medium text-[#0F5C66] hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Doctor</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Date &amp; Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    No recent appointments yet.
                  </td>
                </tr>
              ) : (
                appointments.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F4F4] text-xs font-semibold text-[#0F5C66]">
                          {getInitials(item.patientName)}
                        </div>
                        <span className="font-medium text-foreground">{item.patientName}</span>
                      </div>
                    </td>
                    <td className="py-4 text-foreground">{item.doctorName}</td>
                    <td className="py-4 text-foreground">{item.serviceName}</td>
                    <td className="py-4 text-foreground">{item.dateTime}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status}
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
  )
}