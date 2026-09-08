import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectTenant, selectTenantId } from '@/features/auth/authSlice'
import type { Tenant } from '@/features/tenant/types'
import { DEFAULT_TENANT_NAME } from '@/utils/constants'

type TenantContextValue = {
  tenant: Tenant | null
  tenantId: string | null
  tenantName: string
  /** False while the backend still logs users in without tenant details. */
  isTenantResolved: boolean
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const tenant = useAppSelector(selectTenant)
  const tenantId = useAppSelector(selectTenantId)

  const value = useMemo<TenantContextValue>(
    () => ({
      tenant,
      tenantId,
      tenantName: tenant?.name || DEFAULT_TENANT_NAME,
      isTenantResolved: Boolean(tenantId),
    }),
    [tenant, tenantId],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
