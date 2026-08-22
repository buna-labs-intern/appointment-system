import type { Service, ServiceStats } from '@/features/services/types'

export function getServiceStats(services: Service[]): ServiceStats {
  const active = services.filter((service) => service.isActive).length
  const inactive = services.length - active
  const top = services.find((service) => service.isActive) ?? services[0]

  return {
    total: services.length,
    active,
    inactive,
    topServiceName: top?.name ?? '—',
    topServiceDemandPercent: top ? 78 : 0,
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
