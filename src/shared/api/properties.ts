import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import type { Property, Room, PropertyListParams, RoomListParams, PaginatedResponse, CreatePropertyDto, UpdatePropertyDto, CreateRoomDto, UpdateRoomDto, Floor } from '@/features/tenant-app/types'
import { useAuth } from '../hooks/use-auth'
import { amenitiesApi } from './amenities'
import type { IListAmenitiesQueryDTO } from './amenities'

const PROPERTY_KEYS = {
  all: ['properties'] as const,
  lists: (tenantId: string) => [...PROPERTY_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: PropertyListParams) => [...PROPERTY_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...PROPERTY_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...PROPERTY_KEYS.details(tenantId), id] as const,
  floors: (tenantId: string, id: number) => [...PROPERTY_KEYS.detail(tenantId, id), 'floors'] as const,
}

const ROOM_KEYS = {
  all: ['rooms'] as const,
  lists: (tenantId: string) => [...ROOM_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: RoomListParams) => [...ROOM_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...ROOM_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...ROOM_KEYS.details(tenantId), id] as const,
}

const AMENITY_KEYS = {
  all: ['amenities'] as const,
  lists: () => [...AMENITY_KEYS.all, 'list'] as const,
}

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
      const { data } = await apiClient.get<Property>(`/properties/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useFloors = (propertyId: number | string) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const numericId = Number(propertyId)

  return useQuery({
    queryKey: PROPERTY_KEYS.floors(tenantId, numericId),
    queryFn: async () => {
      const { data } = await apiClient.get<Floor[]>(`/properties/${numericId}/floors`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!numericId && !isNaN(numericId),
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
      const { data } = await apiClient.get<Room>(`/rooms/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useUploadPropertyCoverImage = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post<Property>(`/properties/${id}/cover-image`, formData, {
        tenantId,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists(tenantId) })
    },
  })
}

export const useCreateProperty = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePropertyDto) => {
      const response = await apiClient.post<Property>('/properties', data, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists(tenantId) })
    },
  })
}

export const useUpdateProperty = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePropertyDto) => {
      const response = await apiClient.patch<Property>(`/properties/${id}`, data, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists(tenantId) })
    },
  })
}

export const useCreateRoom = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoomDto) => {
      const response = await apiClient.post<Room>('/rooms', data, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.lists(tenantId) })
    },
  })
}

export const useUpdateRoom = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateRoomDto) => {
      const response = await apiClient.patch<Room>(`/rooms/${id}`, data, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.lists(tenantId) })
    },
  })
}

export const useUpdateRoomMarketplace = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (marketplaceStatus: 'DRAFT' | 'PENDING_REVIEW' | 'HIDDEN') => {
      const response = await apiClient.patch<Room>(`/rooms/${id}/marketplace`, { marketplaceStatus }, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.lists(tenantId) })
    },
  })
}

export const useUploadRoomImages = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))

      const response = await apiClient.post<Room>(`/rooms/${id}/images`, formData, {
        tenantId,
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
    },
  })
}

export const useDeleteRoomImage = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (imageId: number) => {
      await apiClient.delete(`/rooms/${id}/images/${imageId}`, { tenantId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
    },
  })
}

export const useUpdateRoomImage = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ imageId, data }: { imageId: number; data: { isThumbnail?: boolean; caption?: string } }) => {
      const response = await apiClient.patch(`/rooms/${id}/images/${imageId}`, data, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
    },
  })
}

export const useAmenities = (params?: IListAmenitiesQueryDTO) => {
  return useQuery({
    queryKey: [...AMENITY_KEYS.lists(), params],
    queryFn: () => amenitiesApi.list(params),
  })
}

export const useReplaceRoomAmenities = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (amenityIds: number[]) => {
      const response = await apiClient.patch(`/rooms/${id}/amenities`, { amenityIds }, { tenantId })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOM_KEYS.detail(tenantId, id) })
    },
  })
}

