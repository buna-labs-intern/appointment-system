import { ROLES, type Role } from '@/utils/constants'

/**
 * Frontend access matrix (aligned with seed/admin policy).
 * Backend remains the source of truth when APIs are connected.
 */
export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN
}

export function isReceptionist(role?: string | null): boolean {
  return role === ROLES.RECEPTIONIST
}

export function canManageReceptionists(role?: string | null): boolean {
  return isAdmin(role)
}

export function canManageDoctors(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export function canManagePatients(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export function canManageServices(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export function canManageAppointments(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export function canViewReports(role?: string | null): boolean {
  return isAdmin(role)
}

export function canChangeOwnPassword(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export function canViewCurrentUser(role?: string | null): boolean {
  return isAdmin(role) || isReceptionist(role)
}

export type NavAccess = {
  path: string
  roles: Role[]
}

export const NAV_ACCESS: NavAccess[] = [
  { path: '/dashboard', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/appointments', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/patients', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/doctors', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/services', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
  { path: '/reports', roles: [ROLES.ADMIN] },
  { path: '/users', roles: [ROLES.ADMIN] },
  { path: '/profile', roles: [ROLES.ADMIN, ROLES.RECEPTIONIST] },
]

export function canAccessPath(path: string, role?: string | null): boolean {
  const rule = NAV_ACCESS.find((item) => item.path === path)
  if (!rule) return true
  if (!role) return false
  return rule.roles.includes(role as Role)
}
