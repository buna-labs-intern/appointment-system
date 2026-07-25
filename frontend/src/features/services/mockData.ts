import type { Service, ServiceStats } from '@/features/services/types'

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'General Consultation',
    code: 'SRV-001',
    category: 'Consultation',
    description: 'Standard clinic visit for general assessment.',
    price: 25,
    duration: 30,
    isActive: true,
  },
  {
    id: '2',
    name: 'Follow-up Consultation',
    code: 'SRV-002',
    category: 'Consultation',
    description: 'Short visit for reviewing previous treatment.',
    price: 15,
    duration: 15,
    isActive: true,
  },
  {
    id: '3',
    name: 'Pediatrics Consultation',
    code: 'SRV-003',
    category: 'Pediatrics',
    description: 'Consultation for children and adolescents.',
    price: 30,
    duration: 30,
    isActive: true,
  },
  {
    id: '4',
    name: 'Medical Certificate',
    code: 'SRV-004',
    category: 'Admin',
    description: 'Issue medical certificates for work or school.',
    price: 10,
    duration: 10,
    isActive: false,
  },
  {
    id: '5',
    name: 'Blood Pressure Check',
    code: 'SRV-005',
    category: 'Screening',
    description: 'Quick blood pressure measurement and advice.',
    price: 5,
    duration: 10,
    isActive: true,
  },
]

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

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function makeServiceCode(name: string, existing: Service[]) {
  const prefix = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  const next = String(existing.length + 1).padStart(3, '0')
  return `SRV-${prefix || 'XX'}${next}`
}