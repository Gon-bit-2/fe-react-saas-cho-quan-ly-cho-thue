import type { UserProfile } from '@/features/auth/api/types'
import { apiClient } from '@/shared/api/axios-client'

export interface Tenant {
  id: number
  name: string
  domain?: string
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  ownerId: number
  owner?: UserProfile
  createdAt: string
  updatedAt: string
}

export interface LandlordTenant {
  id: number
  name: string
  slug: string
  status: 'ACTIVE' | 'INACTIVE'
  verificationStatus: string
  idCardFrontUrl: string | null
  idCardBackUrl: string | null
  portraitUrl: string | null
  subscriptions: Array<{
    id: number
    status: string
    expiredAt: string
    plan: {
      id: number
      name: string
      maxRooms: number
      allowWebhookPayment: boolean
    }
  }>
  _count: {
    rooms: number
  }
}

export interface Landlord {
  id: number
  fullName: string
  email: string | null
  phone: string | null
  systemRole: string | null
  avatarUrl: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
  emailVerifiedAt: string | null
  phoneVerifiedAt: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  ownedTenants: LandlordTenant[]
  tenantMembers: Array<{
    id: number
    tenantId: number
    status: string
    joinedAt: string | null
    tenant: LandlordTenant
  }>
}

import type { PaginatedResponse } from '@/features/tenant-app/types'

export const adminTenantApi = {
  getTenants: (params?: Record<string, unknown>) => {
    return apiClient.get<PaginatedResponse<Tenant>>('/tenants', { params })
  },
  getTenantDetails: (id: number) => {
    return apiClient.get<Tenant>(`/tenants/${id}`)
  },
}

export const adminLandlordApi = {
  getStats: () => apiClient.get<{ total: number; active: number; locked: number }>('/users/landlords/stats'),
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Landlord>>('/users/landlords', { params }),
  get: (id: number) => apiClient.get<Landlord>(`/users/${id}`),
  updateStatus: (id: number, data: { status: Landlord['status']; reason: string }) =>
    apiClient.patch<Landlord>(`/users/${id}/status`, data),
}

export const adminRenterApi = {
  getRenters: (params?: Record<string, unknown>) => {
    // API lấy danh sách người thuê (tenant) trên toàn hệ thống
    return apiClient.get<PaginatedResponse<UserProfile>>('/admin/renters', { params })
  },
  getRenterDetails: (id: number) => {
    return apiClient.get<UserProfile>(`/admin/renters/${id}`)
  },
}
