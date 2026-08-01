import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, CircleAlert, CalendarDays, UserRound, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
} from '@/features/notifications/notificationsStore'
import type { NotificationType } from '@/features/notifications/types'

const typeStyles: Record<NotificationType, string> = {
  appointment: 'bg-sky-50 text-sky-700',
  patient: 'bg-emerald-50 text-emerald-700',
  system: 'bg-slate-100 text-slate-700',
  alert: 'bg-rose-50 text-rose-700',
}

const typeIcons = {
  appointment: CalendarDays,
  patient: UserRound,
  system: Settings,
  alert: CircleAlert,
}

export default function NotificationsList() {
  const [items, setItems] = useState(getNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => subscribeNotifications(() => setItems(getNotifications())), [])

  const unreadCount = useMemo(() => getUnreadCount(), [items])

  const visible = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !item.isRead)
    return items
  }, [items, filter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clinic alerts and activity updates.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
          className="rounded-lg"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-[#0F5C66] text-white'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-[#0F5C66] text-white'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-4 w-4 text-[#0F5C66]" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visible.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No notifications to show.
            </p>
          ) : (
            visible.map((item) => {
              const Icon = typeIcons[item.type]

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border border-border p-4 transition ${
                    item.isRead ? 'bg-white' : 'bg-[#F3FAFB]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeStyles[item.type]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {!item.isRead ? (
                              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#0F5C66]" />
                            ) : null}
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{item.createdAt}</p>
                        </div>

                        {!item.isRead ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => markNotificationRead(item.id)}
                            className="shrink-0 rounded-lg"
                          >
                            Mark read
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}