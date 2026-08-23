import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type {
  MarketplaceFilters,
  MarketplaceRoom,
  PaginatedResponse,
  CreateViewingBody,
  CreateRentalRequestBody,
} from '@/features/marketplace/types'

type DecimalValue = number | string | null

interface MarketplaceRoomResponse {
  id: number
  title: string
  roomCode: string
  basePrice: DecimalValue
  depositAmount?: DecimalValue
  deposit?: DecimalValue
  electricityPrice: DecimalValue
  waterPrice: DecimalValue
  area: DecimalValue
  maxOccupants: number
  status: string
  marketplaceStatus: string
  description?: string | null
  tenantId: number
  property: {
    id: number
    name: string
    province: string
    provinceCode?: string | null
    district: string | null
    ward: string
    wardCode?: string | null
    addressDetail?: string
    latitude?: DecimalValue
    longitude?: DecimalValue
    type?: string
    propertyType?: string
  }
  images?: MarketplaceRoom['images']
  amenities?: Array<MarketplaceRoom['amenities'][number] | { amenity: MarketplaceRoom['amenities'][number] }>
}

function toNumber(value: DecimalValue | undefined, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNullableNumber(value: DecimalValue | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Chuẩn hóa contract API (decimal string, quan hệ lồng nhau) thành model dùng trong UI. */
export function normalizeMarketplaceRoom(room: MarketplaceRoomResponse): MarketplaceRoom {
  return {
    id: room.id,
    title: room.title,
    roomCode: room.roomCode,
    basePrice: toNumber(room.basePrice),
    depositAmount: toNullableNumber(room.depositAmount ?? room.deposit),
    electricityPrice: toNullableNumber(room.electricityPrice),
    waterPrice: toNullableNumber(room.waterPrice),
    area: toNullableNumber(room.area),
    maxOccupants: room.maxOccupants,
    status: room.status,
    marketplaceStatus: room.marketplaceStatus,
    description: room.description ?? null,
    tenantId: room.tenantId,
    property: {
      id: room.property.id,
      name: room.property.name,
      province: room.property.province,
      provinceCode: room.property.provinceCode ?? null,
      district: room.property.district,
      ward: room.property.ward,
      wardCode: room.property.wardCode ?? null,
      addressDetail: room.property.addressDetail,
      latitude: toNullableNumber(room.property.latitude),
      longitude: toNullableNumber(room.property.longitude),
      type: room.property.type ?? room.property.propertyType ?? '',
    },
    images: room.images ?? [],
    amenities: (room.amenities ?? []).map((item) => ('amenity' in item ? item.amenity : item)),
  }
}
import type { ViewingScheduleDetail } from '@/types/viewing-schedule'

// ─── API Functions ──────────────────────────────────────────────

export const marketplaceApi = {
  listRooms: async (filters: MarketplaceFilters): Promise<PaginatedResponse<MarketplaceRoom>> => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    )
    const { data } = await apiClient.get<PaginatedResponse<MarketplaceRoomResponse>>('/marketplace/rooms', {
      params: cleanFilters,
    })
    return { ...data, data: data.data.map(normalizeMarketplaceRoom) }
  },

  getRoomById: async (id: number): Promise<MarketplaceRoom> => {
    const { data } = await apiClient.get<MarketplaceRoomResponse>(`/marketplace/rooms/${id}`)
    return normalizeMarketplaceRoom(data)
  },

  getAppointmentById: async (id: number) => {
    const { data } = await apiClient.get<ViewingScheduleDetail>(`/room-viewing-appointments/${id}`)
    return data
  },
  createViewing: async (params: { roomId: number; body: CreateViewingBody }) => {
    const { data } = await apiClient.post(`/marketplace/rooms/${params.roomId}/viewing-appointments`, params.body)
    return data
  },

  createRentalRequest: async (params: { roomId: number; body: CreateRentalRequestBody }) => {
    const { data } = await apiClient.post(`/marketplace/rooms/${params.roomId}/rental-requests`, params.body)
    return data
  },

  getFavorites: async (): Promise<MarketplaceRoom[]> => {
    const { data } = await apiClient.get<MarketplaceRoomResponse[]>('/marketplace/favorites')
    return data.map(normalizeMarketplaceRoom)
  },

  addFavorite: async (roomId: number) => {
    const { data } = await apiClient.post(`/marketplace/favorites/${roomId}`)
    return data
  },

  removeFavorite: async (roomId: number) => {
    const { data } = await apiClient.delete(`/marketplace/favorites/${roomId}`)
    return data
  },

  getViewHistory: async (): Promise<MarketplaceRoom[]> => {
    const { data } = await apiClient.get<MarketplaceRoomResponse[]>('/marketplace/view-history')
    return data.map(normalizeMarketplaceRoom)
  },

  recordView: async (roomId: number) => {
    const { data } = await apiClient.post(`/marketplace/rooms/${roomId}/views`)
    return data
  },
}

// ─── React Query Hooks ────────────────────────────────────────

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  rooms: () => [...marketplaceKeys.all, 'rooms'] as const,
  roomList: (filters: MarketplaceFilters) => [...marketplaceKeys.rooms(), filters] as const,
  roomDetail: (id: number) => [...marketplaceKeys.rooms(), id] as const,
  appointmentDetail: (id: number) => [...marketplaceKeys.all, 'appointment', id] as const,
  favorites: () => [...marketplaceKeys.all, 'favorites'] as const,
  viewHistory: () => [...marketplaceKeys.all, 'viewHistory'] as const,
}

export function useMarketplaceRooms(filters: MarketplaceFilters = {}) {
  return useQuery({
    queryKey: marketplaceKeys.roomList(filters),
    queryFn: () => marketplaceApi.listRooms(filters),
  })
}

export function useMarketplaceRoom(id: number) {
  return useQuery({
    queryKey: marketplaceKeys.roomDetail(id),
    queryFn: () => marketplaceApi.getRoomById(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}

export function useCreateViewing() {
  return useMutation({
    mutationFn: marketplaceApi.createViewing,
  })
}

export function useCreateRentalRequest() {
  return useMutation({
    mutationFn: marketplaceApi.createRentalRequest,
  })
}

export function useViewingAppointment(id: number) {
  return useQuery({
    queryKey: marketplaceKeys.appointmentDetail(id),
    queryFn: () => marketplaceApi.getAppointmentById(id),
    enabled: !!id,
  })
}

export function useFavorites() {
  return useQuery({
    queryKey: marketplaceKeys.favorites(),
    queryFn: () => marketplaceApi.getFavorites(),
  })
}

export function useAddFavorite() {
  return useMutation({
    mutationFn: marketplaceApi.addFavorite,
  })
}

export function useRemoveFavorite() {
  return useMutation({
    mutationFn: marketplaceApi.removeFavorite,
  })
}

export function useViewHistory() {
  return useQuery({
    queryKey: marketplaceKeys.viewHistory(),
    queryFn: () => marketplaceApi.getViewHistory(),
  })
}

export function useRecordView() {
  return useMutation({
    mutationFn: marketplaceApi.recordView,
  })
}
