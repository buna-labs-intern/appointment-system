export type Tenant = {
  id: string
  name: string
  slug: string
  email?: string
  phone?: string
  address?: string
}

/** Shape shared by every record the backend scopes to a clinic. */
export type TenantScoped = {
  tenantId?: string | null
}
