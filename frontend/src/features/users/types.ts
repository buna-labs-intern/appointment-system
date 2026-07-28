export type Receptionist = {
    id: string
    fullName: string
    email: string
    role: 'RECEPTIONIST'
    isActive: boolean
    joinDate: string
  }
  
  export type ReceptionistStats = {
    total: number
    active: number
    activeToday: number
    shiftCoveragePercent: number
    avgOnboardingDays: number
  }