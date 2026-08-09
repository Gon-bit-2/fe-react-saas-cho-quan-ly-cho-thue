import { useQuery } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { AssetCategory, RoomAsset } from '@/types/asset'

// Mock Data
export const MOCK_ASSET_CATEGORIES: AssetCategory[] = [
  { id: 1, tenantId: 10, code: 'AC-01', name: 'Điều hoà', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 2, tenantId: 10, code: 'AC-02', name: 'Tủ lạnh', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 3, tenantId: 10, code: 'AC-03', name: 'Giường', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

export const MOCK_ROOM_ASSETS: RoomAsset[] = [
  { id: 1, roomId: 201, categoryId: 1, quantity: 1, condition: 'GOOD', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', category: MOCK_ASSET_CATEGORIES[0] },
  { id: 2, roomId: 201, categoryId: 3, quantity: 2, condition: 'NEW', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', category: MOCK_ASSET_CATEGORIES[2] },
]

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
      try {
        const { data } = await apiClient.get<PaginatedResponse<AssetCategory>>('/asset-categories', {
          params,
          tenantId,
        })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_ASSET_CATEGORIES, meta: { page: 1, limit: 10, total: MOCK_ASSET_CATEGORIES.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_ASSET_CATEGORIES, meta: { page: 1, limit: 10, total: MOCK_ASSET_CATEGORIES.length, totalPages: 1 } }
      }
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
      try {
        const { data } = await apiClient.get<PaginatedResponse<RoomAsset>>(`/rooms/${roomId}/assets`, {
          params,
          tenantId,
        })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_ROOM_ASSETS, meta: { page: 1, limit: 10, total: MOCK_ROOM_ASSETS.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_ROOM_ASSETS, meta: { page: 1, limit: 10, total: MOCK_ROOM_ASSETS.length, totalPages: 1 } }
      }
    },
    enabled: !!tenantId && !!roomId,
  })
}
