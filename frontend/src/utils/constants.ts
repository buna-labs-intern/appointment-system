export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const AUTH_STORAGE_KEY = 'nexacare_auth'

/** Header the backend reads to confirm which clinic a request belongs to. */
export const TENANT_HEADER = 'X-Tenant-Id'

/** Shown until the backend starts returning tenant details on login. */
export const DEFAULT_TENANT_NAME = 'NexaCare'

export const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'My Schedule',
    path: '/my-schedule',
    icon: 'CalendarClock',
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
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
  },
  {
    label: 'Receptionists',
    path: '/users',
    icon: 'UserCog',
  },
]