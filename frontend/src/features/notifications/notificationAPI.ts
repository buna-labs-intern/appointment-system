import api from '@/services/axios'
import type { AppNotification } from '@/features/notifications/types'

export type NotificationListParams = {
  filter?: 'all' | 'unread' | 'read'
  type?: string
  search?: string
  page?: number
  limit?: number
}

function normalizeNotification(item: any): AppNotification {
  return {
    id: String(item.id),
    title: item.title || 'Notification',
    message: item.message || '',
    type: (['appointment', 'patient', 'system', 'alert'].includes(item.type)
      ? item.type
      : 'system') as AppNotification['type'],
    createdAt: item.createdAt
      ? new Date(item.createdAt).toLocaleString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString(),
    isRead: Boolean(item.isRead),
  }
}

export async function fetchNotifications(
  params?: NotificationListParams,
): Promise<AppNotification[]> {
  try {
    const { data } = await api.get('/notifications', { params })
    const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    return list.map(normalizeNotification)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const { data } = await api.get('/notifications/unread-count')
    return data?.data?.unreadCount ?? 0
  } catch {
    return 0
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    await api.patch(`/notifications/${id}/read`)
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    await api.patch('/notifications/read-all')
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

export async function deleteNotificationById(id: string): Promise<boolean> {
  try {
    await api.delete(`/notifications/${id}`)
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

export async function clearAllNotifications(): Promise<boolean> {
  try {
    await api.delete('/notifications/clear-all')
    return true
  } catch (error) {
    console.error('Error clearing notifications:', error)
    return false
  }
}

export async function createNotification(payload: {
  title: string
  message: string
  type?: 'appointment' | 'patient' | 'system' | 'alert'
}): Promise<AppNotification | null> {
  try {
    const { data } = await api.post('/notifications', payload)
    return normalizeNotification(data?.data || data)
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}
