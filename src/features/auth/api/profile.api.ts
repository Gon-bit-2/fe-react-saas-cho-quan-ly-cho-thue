import type { UserProfile } from './types'
import { apiClient } from '@/shared/api/axios-client'

export const profileApi = {
  /** Lấy thông tin profile hiện tại */
  getProfile: () => apiClient.get<UserProfile>('/auth/profile'),

  /** Cập nhật thông tin profile */
  updateProfile: (data: Partial<UserProfile>) => apiClient.put<UserProfile>('/auth/profile', data),
}
