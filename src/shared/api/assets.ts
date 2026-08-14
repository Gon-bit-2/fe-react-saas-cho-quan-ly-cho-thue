import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { AssetCategory, RoomAsset, AssetCondition } from '@/types/asset'

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

export interface CreateAssetCategoryDto {
  name: string
  description?: string | null
}

export type UpdateAssetCategoryDto = Partial<CreateAssetCategoryDto>

export interface CreateRoomAssetDto {
  categoryId: number
  name: string
  quantity: number
  condition?: AssetCondition
  description?: string | null
  imageUrl?: string | null
}

export type UpdateRoomAssetDto = Partial<CreateRoomAssetDto>

export const useAssetCategories = (params: { page?: number; limit?: number; search?: string } = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const cleanParams = params.search ? params : { ...params, search: undefined }

  return useQuery({
    queryKey: [...ASSET_KEYS.categories(tenantId), cleanParams],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AssetCategory>>('/asset-categories', {
        params: cleanParams,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useCreateAssetCategory = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAssetCategoryDto) => {
      const { data } = await apiClient.post<AssetCategory>('/asset-categories', payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.categories(tenantId) })
    },
  })
}

export const useUpdateAssetCategory = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateAssetCategoryDto) => {
      const { data } = await apiClient.patch<AssetCategory>(`/asset-categories/${id}`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.categories(tenantId) })
    },
  })
}

export const useDeleteAssetCategory = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete(`/asset-categories/${id}`, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.categories(tenantId) })
    },
  })
}

export const useRoomAssets = (roomId: number, params: { page?: number; limit?: number; search?: string; condition?: AssetCondition; categoryId?: number } = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const cleanParams = params.search ? params : { ...params, search: undefined }

  return useQuery({
    queryKey: [...ASSET_KEYS.roomAssets(tenantId, roomId), cleanParams],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<RoomAsset>>(`/rooms/${roomId}/assets`, {
        params: cleanParams,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId && !!roomId,
  })
}

export const useCreateRoomAsset = (roomId: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateRoomAssetDto) => {
      const { data } = await apiClient.post<RoomAsset>(`/rooms/${roomId}/assets`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.roomAssets(tenantId, roomId) })
    },
  })
}

export const useUpdateRoomAsset = (roomId: number, assetId: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateRoomAssetDto) => {
      const { data } = await apiClient.patch<RoomAsset>(`/rooms/${roomId}/assets/${assetId}`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.roomAssets(tenantId, roomId) })
    },
  })
}

export const useDeleteRoomAsset = (roomId: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (assetId: number) => {
      const { data } = await apiClient.delete(`/rooms/${roomId}/assets/${assetId}`, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_KEYS.roomAssets(tenantId, roomId) })
    },
  })
}
