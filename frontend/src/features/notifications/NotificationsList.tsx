import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCheck,
  CircleAlert,
  CalendarDays,
  UserRound,
  Settings,
  Trash2,
  RotateCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  refreshNotifications,
  removeNotification,
  clearAll,
  subscribeNotifications,
} from '@/features/notifications/notificationsStore'
import type { NotificationType } from '@/features/notifications/types'

const typeStyles: Record<NotificationType, string> = {
  appointment: 'bg-sky-50 text-sky-700 border-sky-200',
  patient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  system: 'bg-slate-100 text-slate-700 border-slate-200',
  alert: 'bg-rose-50 text-rose-700 border-rose-200',
}

const typeIcons = {
  appointment: CalendarDays,
  patient: UserRound,
  system: Settings,
  alert: CircleAlert,
}

export default function NotificationsList() {
  const [items, setItems] = useState(getNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    return subscribeNotifications(() => setItems(getNotifications()))
  }, [])

  const unreadCount = useMemo(() => getUnreadCount(), [items])

  const visible = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !item.isRead)
    if (filter === 'appointment' || filter === 'patient' || filter === 'system' || filter === 'alert') {
      return items.filter((item) => item.type === filter)
    }
    return items
  }, [items, filter])

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await refreshNotifications()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live clinic alerts and activity updates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-lg gap-1.5"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="rounded-lg gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-[#0F5C66] text-white shadow-sm'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-[#0F5C66] text-white shadow-sm'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('appointment')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'appointment'
              ? 'bg-[#0F5C66] text-white shadow-sm'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          Appointments
        </button>
        <button
          type="button"
          onClick={() => setFilter('patient')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'patient'
              ? 'bg-[#0F5C66] text-white shadow-sm'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          Patients
        </button>
        <button
          type="button"
          onClick={() => setFilter('alert')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            filter === 'alert'
              ? 'bg-[#0F5C66] text-white shadow-sm'
              : 'border border-border bg-white text-foreground hover:bg-muted'
          }`}
        >
          Alerts
        </button>
      </div>

      <Card className="rounded-xl border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#0F5C66]" />
              Inbox ({visible.length})
            </div>
            {unreadCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {visible.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
                <Bell className="h-6 w-6" />
              </div>
              <p className="text-base font-medium text-foreground">No notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : 'Clinic notifications and activity alerts will appear here.'}
              </p>
            </div>
          ) : (
            visible.map((item) => {
              const Icon = typeIcons[item.type] || Bell

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border p-4 transition-all duration-150 hover:shadow-sm ${
                    item.isRead
                      ? 'border-border/60 bg-white'
                      : 'border-[#0F5C66]/20 bg-[#F3FAFB]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${typeStyles[item.type] || 'bg-muted text-foreground'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {!item.isRead && (
                              <span className="inline-block h-2 w-2 rounded-full bg-[#0F5C66] ring-4 ring-[#0F5C66]/10" />
                            )}
                            <p className="font-semibold text-sm text-foreground">
                              {item.title}
                            </p>
                            <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
                              {item.type}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                            {item.message}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground/80 font-medium">
                            {item.createdAt}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                          {!item.isRead && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => markNotificationRead(item.id)}
                              className="h-8 rounded-lg text-xs"
                            >
                              Mark read
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(item.id)}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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