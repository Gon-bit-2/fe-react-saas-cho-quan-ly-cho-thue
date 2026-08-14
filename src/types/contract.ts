export type ContractStatus = 'DRAFT' | 'WAITING_LANDLORD_SIGN' | 'WAITING_RENTER_SIGN' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'CANCELED'
export type ContractBillingCycle = 'MONTHLY' | 'QUARTERLY'

export interface ContractMember {
  id: number
  userId: number
  role: string
  createdAt: string
  user: {
    id: number
    fullName: string
    email: string
    phone: string
  }
}

export interface ContractRoom {
  id: number
  roomCode: string
  title: string
  status: string
  marketplaceStatus: string
  maxOccupants: number
}

export interface ContractRenter {
  id: number
  fullName: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  renterProfile?: {
    id: number
    verificationStatus: string
    identityNumber?: string | null
    identityFrontUrl?: string | null
    identityBackUrl?: string | null
    permanentAddress?: string | null
  } | null
}

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
  members?: ContractMember[]
  room?: ContractRoom
  renter?: ContractRenter
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

export interface RenterInfo {
  fullName?: string
  dateOfBirth?: string | null
  phone?: string | null
  identityNumber?: string | null
  permanentAddress?: string | null
  identityFrontUrl?: string | null
  identityBackUrl?: string | null
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
  renterInfo?: RenterInfo
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
  renterInfo?: RenterInfo
}

export type EmptyContractBody = Record<string, never>
