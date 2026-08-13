import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type { Room, PaginatedResponse } from '@/features/tenant-app/types'

const ADMIN_KEYS = {
  all: ['admin'] as const,
  moderation: {
    all: () => [...ADMIN_KEYS.all, 'moderation'] as const,
    lists: () => [...ADMIN_KEYS.moderation.all(), 'list'] as const,
    list: (params: Record<string, unknown>) => [...ADMIN_KEYS.moderation.lists(), params] as const,
    details: () => [...ADMIN_KEYS.moderation.all(), 'detail'] as const,
    detail: (id: number) => [...ADMIN_KEYS.moderation.details(), id] as const,
    histories: () => [...ADMIN_KEYS.moderation.all(), 'history'] as const,
    history: (id: number) => [...ADMIN_KEYS.moderation.histories(), id] as const,
  }
}

export interface AdminMarketplaceRoom extends Room {
  landlordId?: number
  landlordName?: string
  property?: { id: number; name: string }
  images?: Array<{ id: number; url: string }>
}

export const useAdminModerationRooms = (params: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ADMIN_KEYS.moderation.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AdminMarketplaceRoom>>('/marketplace/admin/rooms', {
        params,
      })
      return data
    },
  })
}

export const useAdminModerationRoom = (id: number) => {
  return useQuery({
    queryKey: ADMIN_KEYS.moderation.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminMarketplaceRoom>(`/marketplace/admin/rooms/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export const useAdminUpdateModerationStatus = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { status: 'PUBLISHED' | 'REJECTED', note?: string }) => {
      const response = await apiClient.patch<AdminMarketplaceRoom>(`/marketplace/admin/rooms/${id}/status`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.moderation.detail(id) })
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.moderation.lists() })
    },
  })
}
