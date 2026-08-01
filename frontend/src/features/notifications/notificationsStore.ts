import { mockNotifications } from '@/features/notifications/mockData'
import type { AppNotification } from '@/features/notifications/types'

let items: AppNotification[] = mockNotifications.map((item) => ({ ...item }))
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getNotifications() {
  return items
}

export function getUnreadCount() {
  return items.filter((item) => !item.isRead).length
}

export function subscribeNotifications(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function markNotificationRead(id: string) {
  items = items.map((item) => (item.id === id ? { ...item, isRead: true } : item))
  notify()
}

export function markAllNotificationsRead() {
  items = items.map((item) => ({ ...item, isRead: true }))
  notify()
}