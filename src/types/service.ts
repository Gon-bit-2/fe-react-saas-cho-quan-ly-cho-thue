export const ServiceType = {
  SERVICE: 'SERVICE',
  PARKING: 'PARKING',
  INTERNET: 'INTERNET',
  OTHER: 'OTHER',
} as const
export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType]

export const ServiceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus]

export interface Service {
  id: number
  tenantId: number
  code: string
  name: string
  description?: string
  defaultUnitPrice: number
  unitLabel: string
  itemType: ServiceType
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceAssignment {
  serviceId: number
  service?: Service
  roomId?: number
  contractId?: number
  quantity: number
  assignedDate: string
  createdAt: string
  updatedAt: string
}
