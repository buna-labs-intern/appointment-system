export type NotificationType = 'appointment' | 'patient' | 'system' | 'alert';

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateNotificationPayload {
  title: string;
  message: string;
  type?: NotificationType | string;
}

export interface INotificationQueryOptions {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  search?: string;
}
