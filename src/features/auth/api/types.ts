export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

export interface UserTenantSummary {
  id?: number
  name?: string
  address?: string | null
  idCardFrontUrl?: string | null
  idCardBackUrl?: string | null
  [key: string]: unknown
}

export interface UserTenantMember {
  id?: number
  tenantId?: number
  roleId?: string
  tenant?: UserTenantSummary
  [key: string]: unknown
}

export interface UserProfile {
  id: number
  fullName: string
  email: string
  phone?: string | null
  systemRole?: string | null
  avatarUrl?: string | null
  status: UserStatus
  emailVerifiedAt?: string | null
  phoneVerifiedAt?: string | null
  lastLoginAt?: string | null
  tenantMembers: UserTenantMember[]
  renterProfile?: {
    id: number
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
    permanentAddress?: string | null
    identityFrontUrl?: string | null
    identityBackUrl?: string | null
  } | null
  createdAt: string
  updatedAt: string
}
