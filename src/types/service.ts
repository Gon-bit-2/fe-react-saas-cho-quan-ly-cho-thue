export enum ServiceType {
  SERVICE = 'SERVICE',
  PARKING = 'PARKING',
  INTERNET = 'INTERNET',
  OTHER = 'OTHER',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Service {
  id: number
  tenantId: number
  name: string
  description?: string
  price: number
  unit: string
  type: ServiceType
  status: ServiceStatus
  createdAt: string
  updatedAt: string
}

export interface ServiceAssignment {
  id: number
  serviceId: number
  service?: Service
  roomId?: number
  contractId?: number
  quantity: number
  assignedDate: string
  createdAt: string
  updatedAt: string
}
