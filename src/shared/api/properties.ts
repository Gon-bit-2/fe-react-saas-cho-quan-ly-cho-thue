import { useQuery } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type { Property, Room, PropertyListParams, RoomListParams, PaginatedResponse } from '@/features/tenant-app/types'
import { useAuth } from '../hooks/use-auth'

const PROPERTY_KEYS = {
  all: ['properties'] as const,
  lists: (tenantId: string) => [...PROPERTY_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: PropertyListParams) => [...PROPERTY_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...PROPERTY_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...PROPERTY_KEYS.details(tenantId), id] as const,
}

const ROOM_KEYS = {
  all: ['rooms'] as const,
  lists: (tenantId: string) => [...ROOM_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: RoomListParams) => [...ROOM_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...ROOM_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...ROOM_KEYS.details(tenantId), id] as const,
}

// Fallback Mock Data
const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    name: 'Tòa nhà A',
    address: '123 Đường X',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng',
    propertyType: 'APARTMENT',
    floorsCount: 5,
    roomsCount: 20,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Nhà trọ sinh viên',
    address: '456 Đường Y',
    province: 'TP.HCM',
    district: 'Thủ Đức',
    ward: 'Linh Trung',
    propertyType: 'ROOM',
    floorsCount: 2,
    roomsCount: 10,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
]

const MOCK_ROOMS: Room[] = [
  {
    id: 1,
    propertyId: 1,
    roomCode: '101',
    floor: 1,
    area: 25,
    basePrice: 3500000,
    maxOccupants: 2,
    status: 'OCCUPIED',
    marketplaceStatus: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    propertyId: 1,
    roomCode: '102',
    floor: 1,
    area: 30,
    basePrice: 4000000,
    maxOccupants: 3,
    status: 'AVAILABLE',
    marketplaceStatus: 'PUBLISHED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    propertyId: 2,
    roomCode: 'A1',
    floor: 1,
    area: 15,
    basePrice: 1500000,
    maxOccupants: 1,
    status: 'MAINTENANCE',
    marketplaceStatus: 'UNPUBLISHED',
    createdAt: new Date().toISOString(),
  },
]

export const useProperties = (params: PropertyListParams = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: PROPERTY_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Property>>('/properties', {
        params,
        tenantId,
      })

      if (!data.data || data.data.length === 0) {
        return {
          data: MOCK_PROPERTIES,
          meta: { page: 1, limit: 10, total: MOCK_PROPERTIES.length, totalPages: 1 },
        }
      }

      return data
    },
    enabled: !!tenantId,
  })
}

export const useProperty = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: PROPERTY_KEYS.detail(tenantId, id),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Property>(`/properties/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mockProp = MOCK_PROPERTIES.find((p) => p.id === id)
          if (mockProp) return mockProp
        }
        throw error
      }
    },
    enabled: !!tenantId && !!id,
  })
}

export const useRooms = (params: RoomListParams = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: ROOM_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Room>>('/rooms', {
        params,
        tenantId,
      })

      if (!data.data || data.data.length === 0) {
        return {
          data: MOCK_ROOMS,
          meta: { page: 1, limit: 10, total: MOCK_ROOMS.length, totalPages: 1 },
        }
      }

      return data
    },
    enabled: !!tenantId,
  })
}

export const useRoom = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: ROOM_KEYS.detail(tenantId, id),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Room>(`/rooms/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mockRoom = MOCK_ROOMS.find((r) => r.id === id)
          if (mockRoom) return mockRoom
        }
        throw error
      }
    },
    enabled: !!tenantId && !!id,
  })
}
