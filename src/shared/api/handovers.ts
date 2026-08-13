import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { HandoverRecord, HandoverType, AssetCondition } from '@/types/asset'

const HANDOVER_KEYS = {
  all: ['handovers'] as const,
  lists: (tenantId: string) => [...HANDOVER_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: Record<string, unknown>) => [...HANDOVER_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...HANDOVER_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...HANDOVER_KEYS.details(tenantId), id] as const,
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

export interface HandoverItemPayload {
  roomAssetId: number
  actualQuantity: number
  condition: AssetCondition
  note?: string | null
  imageUrl?: string | null
}

export interface CreateHandoverBody {
  contractId: number
  type: HandoverType
  note?: string | null
  items?: HandoverItemPayload[]
}

export interface ConfirmHandoverBody {
  version: number
}

export interface DisputeHandoverBody {
  version: number
  reason: string
}

export interface ResolveHandoverBody {
  version: number
  resolutionNote: string
  note?: string | null
  items?: HandoverItemPayload[]
}

export const useHandovers = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: HANDOVER_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<HandoverRecord>>('/handovers', { params, tenantId })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: HANDOVER_KEYS.detail(tenantId, id),
    queryFn: async () => {
      const { data } = await apiClient.get<HandoverRecord>(`/handovers/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useCreateHandover = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateHandoverBody) => {
      const { data } = await apiClient.post<HandoverRecord>('/handovers', payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.lists(tenantId) })
    },
  })
}

export const useConfirmHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ConfirmHandoverBody) => {
      const { data } = await apiClient.patch<HandoverRecord>(`/handovers/${id}/confirm`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.lists(tenantId) })
    },
  })
}

export const useDisputeHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: DisputeHandoverBody) => {
      const { data } = await apiClient.patch<HandoverRecord>(`/handovers/${id}/dispute`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.lists(tenantId) })
    },
  })
}

export const useResolveHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ResolveHandoverBody) => {
      const { data } = await apiClient.patch<HandoverRecord>(`/handovers/${id}/resolve`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: HANDOVER_KEYS.lists(tenantId) })
    },
  })
}
