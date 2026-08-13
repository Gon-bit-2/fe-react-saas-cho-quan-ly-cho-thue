import { apiClient } from './axios-client'

export type TListingModerationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN'

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
  marketplaceStatus?: TListingModerationStatus
  search?: string
}

interface RawAdminRoom {
  id: number
  title: string
  property?: { name: string }
  updatedAt?: string
  createdAt?: string
  marketplaceStatus: TListingModerationStatus
  images?: Array<{ url: string }>
}

export const listingsModerationApi = {
  list: async (params?: IListingsModerationQueryDTO) => {
    const { data } = await apiClient.get<{ data: RawAdminRoom[]; meta: { total?: number; totalItems?: number } }>('/marketplace/admin/rooms', { params })
    const mapped = (data.data || []).map((r: RawAdminRoom) => ({
      id: r.id.toString(),
      roomName: r.title,
      tenantName: r.property?.name || 'N/A',
      submittedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
      status: r.marketplaceStatus,
      image: r.images?.[0]?.url || undefined
    }))
    return { data: mapped, total: data.meta?.total || data.meta?.totalItems || 0 }
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/marketplace/admin/rooms/${id}`)
    return data
  },
  getHistory: async (id: string) => {
    const { data } = await apiClient.get(`/marketplace/admin/rooms/${id}/history`)
    return data?.data || []
  },
  updateStatus: async (id: string, payload: { status: TListingModerationStatus; note?: string }) => {
    const { data } = await apiClient.patch(`/marketplace/admin/rooms/${id}/status`, { marketplaceStatus: payload.status, note: payload.note })
    return data
  }
}
