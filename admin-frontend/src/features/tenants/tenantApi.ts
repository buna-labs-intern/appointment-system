import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/lib/api'
import type { BranchSummary, CreateTenantInput, Tenant, UpdateTenantInput } from '@/types/api'

export type TenantsListResult = {
  data: Tenant[]
  meta?: { page?: number; limit?: number; total?: number; totalPage?: number; totalPages?: number }
}

export type TenantListParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: 'true' | 'false'
}

export const tenantApi = {
  async list(params: TenantListParams): Promise<TenantsListResult> {
    const envelope = await apiGet<Tenant[]>('/tenants', {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      isActive: params.isActive,
    })
    return { data: envelope.data ?? [], meta: envelope.meta }
  },

  async getById(id: string): Promise<Tenant> {
    const envelope = await apiGet<Tenant>(`/tenants/${id}`)
    return envelope.data
  },

  async branches(id: string): Promise<BranchSummary[]> {
    const envelope = await apiGet<BranchSummary[]>(`/tenants/${id}/branches`)
    return envelope.data ?? []
  },

  async create(input: CreateTenantInput): Promise<Tenant> {
    const envelope = await apiPost<Tenant>('/tenants', input)
    return envelope.data
  },

  async update(id: string, input: UpdateTenantInput): Promise<Tenant> {
    const envelope = await apiPut<Tenant>(`/tenants/${id}`, input)
    return envelope.data
  },

  async block(id: string, reason?: string): Promise<Tenant> {
    const envelope = await apiPatch<Tenant>(`/tenants/${id}/block`, { reason })
    return envelope.data
  },

  async unblock(id: string): Promise<Tenant> {
    const envelope = await apiPatch<Tenant>(`/tenants/${id}/unblock`)
    return envelope.data
  },

  async remove(id: string): Promise<void> {
    await apiDelete<null>(`/tenants/${id}`)
  },
}
