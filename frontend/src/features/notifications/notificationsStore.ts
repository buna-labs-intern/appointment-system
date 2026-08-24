import type { AppNotification } from '@/features/notifications/types'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  clearAllNotifications as clearAllAPI,
} from '@/features/notifications/notificationAPI'

let items: AppNotification[] = []
let unreadCount: number = 0
let isInitialized = false
let syncInterval: any = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('Error notifying notification listener:', err)
    }
  })
}

export function getNotifications(): AppNotification[] {
  return items
}

export function getUnreadCount(): number {
  return unreadCount
}

export async function refreshNotifications(): Promise<AppNotification[]> {
  try {
    const [fetchedItems, count] = await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ])
    items = fetchedItems
    unreadCount = count
    notify()
    return items
  } catch (error) {
    console.error('Failed to sync notifications:', error)
    return items
  }
}

function startSync() {
  if (syncInterval) return
  syncInterval = setInterval(() => {
    refreshNotifications()
  }, 20000) // Poll every 20s for new alerts
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener)

  if (!isInitialized) {
    isInitialized = true
    refreshNotifications()
    startSync()
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const target = items.find((item) => item.id === id)
  if (target && !target.isRead) {
    unreadCount = Math.max(0, unreadCount - 1)
  }
  items = items.map((item) => (item.id === id ? { ...item, isRead: true } : item))
  notify()

  await markNotificationAsRead(id)
}

export async function markAllNotificationsRead(): Promise<void> {
  items = items.map((item) => ({ ...item, isRead: true }))
  unreadCount = 0
  notify()

  await markAllNotificationsAsRead()
}

export async function removeNotification(id: string): Promise<void> {
  const target = items.find((item) => item.id === id)
  if (target && !target.isRead) {
    unreadCount = Math.max(0, unreadCount - 1)
  }
  items = items.filter((item) => item.id !== id)
  notify()

  await deleteNotificationById(id)
}

export async function clearAll(): Promise<void> {
  items = []
  unreadCount = 0
  notify()

  await clearAllAPI()
}