import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type { 
  MarketplaceFilters, 
  MarketplaceRoom, 
  PaginatedResponse,
  CreateViewingBody,
  CreateRentalRequestBody
} from '@/features/marketplace/types'

// ─── API Functions ──────────────────────────────────────────────

export const marketplaceApi = {
  listRooms: async (filters: MarketplaceFilters): Promise<PaginatedResponse<MarketplaceRoom>> => {
    const { data } = await apiClient.get<PaginatedResponse<MarketplaceRoom>>('/marketplace/rooms', {
      params: filters
    })
    return data
  },

  getRoomById: async (id: number): Promise<MarketplaceRoom> => {
    const { data } = await apiClient.get<MarketplaceRoom>(`/marketplace/rooms/${id}`)
    return data
  },

  createViewing: async (params: { roomId: number, body: CreateViewingBody }) => {
    const { data } = await apiClient.post(`/marketplace/rooms/${params.roomId}/viewing-appointments`, params.body)
    return data
  },

  createRentalRequest: async (params: { roomId: number, body: CreateRentalRequestBody }) => {
    const { data } = await apiClient.post(`/marketplace/rooms/${params.roomId}/rental-requests`, params.body)
    return data
  }
}

// ─── React Query Hooks ────────────────────────────────────────

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  rooms: () => [...marketplaceKeys.all, 'rooms'] as const,
  roomList: (filters: MarketplaceFilters) => [...marketplaceKeys.rooms(), filters] as const,
  roomDetail: (id: number) => [...marketplaceKeys.rooms(), id] as const,
}

export function useMarketplaceRooms(filters: MarketplaceFilters = {}) {
  return useQuery({
    queryKey: marketplaceKeys.roomList(filters),
    queryFn: () => marketplaceApi.listRooms(filters)
  })
}

export function useMarketplaceRoom(id: number) {
  return useQuery({
    queryKey: marketplaceKeys.roomDetail(id),
    queryFn: () => marketplaceApi.getRoomById(id),
    enabled: !!id
  })
}

export function useCreateViewing() {
  return useMutation({
    mutationFn: marketplaceApi.createViewing
  })
}

export function useCreateRentalRequest() {
  return useMutation({
    mutationFn: marketplaceApi.createRentalRequest
  })
}
