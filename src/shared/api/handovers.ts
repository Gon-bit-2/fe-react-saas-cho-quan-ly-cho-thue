import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { HandoverRecord } from '@/types/asset'

export const MOCK_HANDOVERS: HandoverRecord[] = [
  {
    id: 1,
    contractId: 1,
    roomId: 201,
    type: 'CHECKIN',
    status: 'CONFIRMED',
    handoverDate: '2026-08-01T10:00:00Z',
    items: [],
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    contractId: 2,
    roomId: 202,
    type: 'CHECKOUT',
    status: 'DISPUTED',
    handoverDate: '2026-08-15T10:00:00Z',
    notes: 'Thiếu một số đồ đạc',
    items: [],
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  }
]

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
      try {
        const { data } = await apiClient.get<PaginatedResponse<HandoverRecord>>('/handovers', { params, tenantId })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_HANDOVERS, meta: { page: 1, limit: 10, total: MOCK_HANDOVERS.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_HANDOVERS, meta: { page: 1, limit: 10, total: MOCK_HANDOVERS.length, totalPages: 1 } }
      }
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
      try {
        const { data } = await apiClient.get<HandoverRecord>(`/handovers/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mock = MOCK_HANDOVERS.find(h => h.id === id)
          if (mock) return mock
        }
        throw error
      }
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
