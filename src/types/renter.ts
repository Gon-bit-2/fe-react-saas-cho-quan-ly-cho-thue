export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type RenterVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
export type RentalHistoryStatus = 'ACTIVE' | 'ENDED' | 'TERMINATED'

export interface Renter {
  id: number
  userId: number
  fullName: string
  email: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: Gender | null
  identityNumber?: string | null
  identityFrontUrl?: string | null
  identityBackUrl?: string | null
  permanentAddress?: string | null
  occupation?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  verificationStatus: RenterVerificationStatus
  createdAt: string
  updatedAt: string
}

export interface ListRentersQuery {
  page?: number
  limit?: number
  search?: string
  verificationStatus?: RenterVerificationStatus
}

export interface ListRentalHistoryQuery {
  page?: number
  limit?: number
  status?: RentalHistoryStatus
}

export interface UpdateRenterProfileBody {
  dateOfBirth?: string | null
  gender?: Gender | null
  identityNumber?: string | null
  identityFrontUrl?: string | null
  identityBackUrl?: string | null
  permanentAddress?: string | null
  occupation?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
}

export interface InviteRenterBody {
  fullName: string
  email: string
  phone?: string
}

export interface RenterInvitation {
  id: number
  tenantId: number
  email: string
  fullName: string
  phone?: string | null
  expiresAt: string
  acceptedAt?: string | null
  acceptedUserId?: number | null
  revokedAt?: string | null
  status: 'ACCEPTED' | 'CANCELED' | 'EXPIRED' | 'PENDING'
  tenant: { id: number; name: string }
  createdBy: { id: number; fullName: string }
  room?: { id: number; roomCode: string; title: string }
  property?: { id: number; name: string }
  createdAt: string
  updatedAt: string
}

export interface AcceptRenterInvitationBody {
  email: string
  code: string
  password?: string
  confirmPassword?: string
}

export interface UpdateRenterForLandlordBody {
  fullName?: string
  phone?: string | null
  dateOfBirth?: string | null
  gender?: Gender | null
  identityNumber?: string | null
  identityFrontUrl?: string | null
  identityBackUrl?: string | null
  permanentAddress?: string | null
  occupation?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
}
