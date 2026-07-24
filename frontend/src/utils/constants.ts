export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const AUTH_STORAGE_KEY = 'nexacare_auth'

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: 'CalendarDays',
  },
  {
    label: 'Patients',
    path: '/patients',
    icon: 'Users',
  },
  {
    label: 'Doctors',
    path: '/doctors',
    icon: 'Stethoscope',
  },
  {
    label: 'Services',
    path: '/services',
    icon: 'ClipboardList',
  },
  {
    label: 'Receptionists',
    path: '/users',
    icon: 'UserCog',
  },
]
