export type Service = {
    id: string
    name: string
    code: string
    category: string
    description: string
    price: number
    duration: number
    isActive: boolean
  }
  
  export type ServiceStats = {
    total: number
    active: number
    inactive: number
    topServiceName: string
    topServiceDemandPercent: number
  }