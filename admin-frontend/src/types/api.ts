export type Tenant = {
  id: string
  name: string
  slug: string
  phone?: string | null
  address?: string | null
  isActive: boolean
  blockedAt?: string | null
  blockedReason?: string | null
  defaultBranchId?: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    branches: number
    users: number
    patients: number
  }
  owner?: {
    id: string
    fullName: string
    email: string
    phone?: string | null
    isActive: boolean
  } | null
  defaultBranch?: {
    id: string
    name: string
    slug: string
  } | null
}

export type TenantOwnerInput = {
  fullName: string
  email: string
  phone: string
  password: string
}

export type CreateTenantInput = {
  name: string
  slug?: string
  address?: string
  phone?: string
  owner: TenantOwnerInput
}

export type UpdateTenantInput = {
  name?: string
  slug?: string
  address?: string | null
  phone?: string | null
  defaultBranchId?: string | null
}

export type BranchSummary = {
  id: string
  name: string
  slug: string
  address?: string | null
  phone?: string | null
  isActive: boolean
  blockedAt?: string | null
  blockedReason?: string | null
  createdAt: string
  _count?: {
    doctors: number
    appointments: number
    userBranches: number
  }
}

export type AdminUser = {
  id: string
  fullName: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'RECEPTIONIST'
  tenantId?: string | null
  mustChangePassword?: boolean
}

export type AuthSession = {
  user: AdminUser
  token: string
  tenant: Tenant | null
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPage?: number
  totalPages?: number
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  meta?: PaginationMeta
  data: T
}
