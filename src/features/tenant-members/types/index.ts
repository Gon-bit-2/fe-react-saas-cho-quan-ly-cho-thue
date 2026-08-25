export interface Role {
  id: string
  name: string
}

export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
}

export interface TenantMember {
  id: number
  tenantId: number
  userId: number
  roleId: string
  status: 'ACTIVE' | 'INACTIVE'
  joinedAt: string
  user: User
  role: Role
}

export interface AddTenantMemberPayload {
  email: string
  fullName: string
  roleId: string
}

export interface UpdateTenantMemberRolePayload {
  roleId: string
}
