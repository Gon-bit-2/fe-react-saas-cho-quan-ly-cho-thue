export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

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
  tenantMembers: Record<string, unknown>[] // TenantMembership array
  renterProfile?: {
    id: number
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  } | null
  createdAt: string
  updatedAt: string
}
