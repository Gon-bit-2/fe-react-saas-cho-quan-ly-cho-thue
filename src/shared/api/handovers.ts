import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { HandoverRecord } from '@/types/asset'



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

export const useDisputeHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: { notes: string }) => {
      const { data } = await apiClient.patch(`/handovers/${id}/dispute`, payload, { tenantId })
      return data
    }
  })
}

export const useResolveHandover = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: { notes: string }) => {
      const { data } = await apiClient.patch(`/handovers/${id}/resolve`, payload, { tenantId })
      return data
    }
  })
}
