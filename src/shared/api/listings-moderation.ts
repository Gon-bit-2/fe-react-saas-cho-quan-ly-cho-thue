import { apiClient } from './axios-client'

export type TListingModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN'

export interface IListingModerationDTO {
  id: string
  roomName: string
  tenantName: string
  submittedAt: string
  status: TListingModerationStatus
  image?: string
}

export interface IListingsModerationQueryDTO {
  page?: number
  limit?: number
  status?: TListingModerationStatus
  search?: string
}

export const listingsModerationApi = {
  list: async (params?: IListingsModerationQueryDTO) => {
    const { data } = await apiClient.get<{ data: IListingModerationDTO[], total: number }>('/admin/listings/moderation', { params })
    return data || { data: [], total: 0 }
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/admin/listings/moderation/${id}`)
    return data
  },
  getHistory: async (id: string) => {
    const { data } = await apiClient.get(`/admin/listings/moderation/${id}/history`)
    return data || []
  },
  updateStatus: async (id: string, payload: { status: TListingModerationStatus, note?: string }) => {
    const { data } = await apiClient.patch(`/admin/listings/moderation/${id}/status`, payload)
    return data
  }
}
