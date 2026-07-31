import { ROLES } from '@/utils/constants'
import type { AuthUser } from '@/features/auth/authSlice'

/** Seed admin — only one administrator created during database seeding. */
export const SEED_ADMIN = {
  email: 'admin@hospital.com',
  password: 'Admin@12345',
  user: {
    id: 'seed-admin',
    email: 'admin@hospital.com',
    fullName: 'System Administrator',
    role: ROLES.ADMIN,
    mustChangePassword: false,
  } satisfies AuthUser,
}

/**
 * Frontend-only receptionist demo for local UI testing when the API is down.
 * Not part of database seeding (seed creates only the admin above).
 */
export const DEMO_RECEPTIONIST = {
  email: 'receptionist@hospital.com',
  password: 'Reception@12345',
  user: {
    id: 'demo-receptionist',
    email: 'receptionist@hospital.com',
    fullName: 'Clinic Receptionist',
    role: ROLES.RECEPTIONIST,
    mustChangePassword: false,
  } satisfies AuthUser,
}

export function resolveLocalLogin(
  email: string,
  password: string,
): AuthUser | null {
  const normalized = email.trim().toLowerCase()

  if (
    normalized === SEED_ADMIN.email &&
    password === SEED_ADMIN.password
  ) {
    return SEED_ADMIN.user
  }

  if (
    normalized === DEMO_RECEPTIONIST.email &&
    password === DEMO_RECEPTIONIST.password
  ) {
    return DEMO_RECEPTIONIST.user
  }

  return null
}
