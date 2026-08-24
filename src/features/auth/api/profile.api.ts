import type { UserProfile } from './types'
import { apiClient } from '@/shared/api/axios-client'

export const profileApi = {
  /** Lấy thông tin profile hiện tại */
  getProfile: () => apiClient.get<UserProfile>('/auth/profile'),

  /** Cập nhật thông tin profile */
  updateProfile: (data: Partial<UserProfile>) => apiClient.patch<UserProfile>('/auth/profile', data),

  /** Cập nhật thông tin xác minh (dành cho chủ trọ/quản lý) */
  updateTenantVerification: (data: Record<string, unknown>) => apiClient.patch('/tenants/me/verification', data),

  /** Cập nhật thông tin xác minh (dành cho người thuê) */
  updateRenterProfile: (data: Record<string, unknown>) => apiClient.patch('/renters/me', data),
}
