import type { Receptionist, ReceptionistStats } from '@/features/users/types'

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
