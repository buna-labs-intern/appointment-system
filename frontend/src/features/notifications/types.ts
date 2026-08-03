export type NotificationType = 'appointment' | 'patient' | 'system' | 'alert'

export type AppNotification = {
  id: string
  title: string
  message: string
  type: NotificationType
  createdAt: string
  isRead: boolean
}