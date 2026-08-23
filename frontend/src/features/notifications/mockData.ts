import type { AppNotification } from '@/features/notifications/types'

export const mockNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Appointment starting soon',
    message: 'Hiba Ahmedhussen with dr.dude at 11:30 — confirm check-in readiness.',
    type: 'appointment',
    createdAt: '2026-07-31 09:15',
    isRead: false,
  },
  {
    id: '2',
    title: 'New patient registered',
    message: 'Sara Ali was added to the patient list by front desk.',
    type: 'patient',
    createdAt: '2026-07-31 08:40',
    isRead: false,
  },
  {
    id: '3',
    title: 'Service deactivated',
    message: 'Medical Certificate was marked inactive and cannot be booked.',
    type: 'system',
    createdAt: '2026-07-30 16:20',
    isRead: true,
  },
  {
    id: '4',
    title: 'High no-show risk',
    message: 'A patient with 2+ prior no-shows has a visit tomorrow morning.',
    type: 'alert',
    createdAt: '2026-07-30 14:05',
    isRead: true,
  },
]