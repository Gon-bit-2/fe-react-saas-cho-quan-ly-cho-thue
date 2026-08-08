export type ContractStatus = 'DRAFT' | 'WAITING_LANDLORD_SIGN' | 'WAITING_RENTER_SIGN' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'CANCELED'
export type ContractBillingCycle = 'MONTHLY' | 'QUARTERLY'

export interface Contract {
  id: number
  roomId: number
  renterId: number
  rentalRequestId?: number | null
  templateId?: number | null
  contractCode?: string
  startDate: string
  endDate: string
  monthlyPrice: number
  depositAmount: number
  billingCycle: ContractBillingCycle
  paymentDueDay: number
  contentSnapshot: string
  status: ContractStatus
  createdAt: string
  updatedAt: string
}

export interface ListContractsQuery {
  page?: number
  limit?: number
  status?: ContractStatus
  roomId?: number
  renterId?: number
  propertyId?: number
  search?: string
}

export interface CreateContractBody {
  roomId: number
  renterId: number
  rentalRequestId?: number | null
  templateId?: number | null
  contractCode?: string
  startDate: string
  endDate: string
  monthlyPrice: number
  depositAmount: number
  billingCycle: ContractBillingCycle
  paymentDueDay: number
  contentSnapshot: string
  coRenterIds?: number[]
}

export interface UpdateContractBody {
  startDate?: string
  endDate?: string
  monthlyPrice?: number
  depositAmount?: number
  billingCycle?: ContractBillingCycle
  paymentDueDay?: number
  contentSnapshot?: string
  coRenterIds?: number[]
}

export type EmptyContractBody = Record<string, never>
