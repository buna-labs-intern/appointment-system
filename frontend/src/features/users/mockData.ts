import type { Receptionist, ReceptionistStats } from '@/features/users/types'

export const mockReceptionists: Receptionist[] = [
  {
    id: '1',
    fullName: 'dule cumbe',
    email: 'dumba@gmail.com',
    role: 'RECEPTIONIST',
    isActive: true,
    joinDate: '2024-07-24',
  },
  {
    id: '2',
    fullName: 'Sara Ali',
    email: 'sara.ali@nexacare.com',
    role: 'RECEPTIONIST',
    isActive: true,
    joinDate: '2025-01-12',
  },
  {
    id: '3',
    fullName: 'John Bekele',
    email: 'john.bekele@nexacare.com',
    role: 'RECEPTIONIST',
    isActive: false,
    joinDate: '2024-11-03',
  },
]

export function getReceptionistStats(staff: Receptionist[]): ReceptionistStats {
  const active = staff.filter((s) => s.isActive).length

  return {
    total: staff.length,
    active,
    activeToday: active,
    shiftCoveragePercent: staff.length === 0 ? 0 : Math.round((active / staff.length) * 100),
    avgOnboardingDays: 2.4,
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}