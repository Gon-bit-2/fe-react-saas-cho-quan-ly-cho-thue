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

export const adminTenantApi = {
  getTenants: (params?: Record<string, unknown>) => {
    return apiClient.get<Tenant[]>('/admin/tenants', { params })
  },
  getTenantDetails: (id: number) => {
    return apiClient.get<Tenant>(`/admin/tenants/${id}`)
  },
}

export const adminRenterApi = {
  getRenters: (params?: Record<string, unknown>) => {
    // API lấy danh sách người thuê (tenant) trên toàn hệ thống
    return apiClient.get<UserProfile[]>('/admin/renters', { params })
  },
  getRenterDetails: (id: number) => {
    return apiClient.get<UserProfile>(`/admin/renters/${id}`)
  },
}
