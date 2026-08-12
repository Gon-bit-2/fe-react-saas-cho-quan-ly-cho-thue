import { useQuery } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { AssetCategory, RoomAsset } from '@/types/asset'


const ASSET_KEYS = {
  allCategories: ['asset-categories'] as const,
  categories: (tenantId: string) => [...ASSET_KEYS.allCategories, tenantId] as const,
  allRoomAssets: ['room-assets'] as const,
  roomAssets: (tenantId: string, roomId: number) => [...ASSET_KEYS.allRoomAssets, tenantId, roomId] as const,
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useAssetCategories = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: [...ASSET_KEYS.categories(tenantId), params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AssetCategory>>('/asset-categories', {
        params,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useRoomAssets = (roomId: number, params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: [...ASSET_KEYS.roomAssets(tenantId, roomId), params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<RoomAsset>>(`/rooms/${roomId}/assets`, {
        params,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId && !!roomId,
  })
}
