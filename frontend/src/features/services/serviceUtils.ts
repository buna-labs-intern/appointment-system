import type { Service, ServiceStats } from '@/features/services/types'

export function getServiceStats(services: Service[]): ServiceStats {
  const active = services.filter((s) => s.isActive).length
  const inactive = services.length - active
  const top = services.find((s) => s.isActive) ?? services[0]

  return {
    total: services.length,
    active,
    inactive,
    topServiceName: top?.name ?? '—',
    topServiceDemandPercent: top ? 78 : 0,
  }
}

export function makeServiceCode(name: string, existing: Service[]): string {
  const prefix = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  const next = String(existing.length + 1).padStart(3, '0')
  return `SRV-${prefix || 'XX'}${next}`
}
