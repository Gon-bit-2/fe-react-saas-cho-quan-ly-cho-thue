import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { ContractTerminationRequest } from '@/types/termination'

export const MOCK_TERMINATIONS: ContractTerminationRequest[] = [
  {
    id: 1,
    contractId: 1,
    renterId: 101,
    requestedDate: '2026-07-20T10:00:00Z',
    desiredEndDate: '2026-08-01T10:00:00Z',
    reason: 'Chuyển chỗ làm',
    status: 'PENDING',
    createdAt: '2026-07-20T10:00:00Z',
    updatedAt: '2026-07-20T10:00:00Z',
  }
]

const TERMINATION_KEYS = {
  all: ['terminations'] as const,
  lists: (tenantId: string) => [...TERMINATION_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: Record<string, unknown>) => [...TERMINATION_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...TERMINATION_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...TERMINATION_KEYS.details(tenantId), id] as const,
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

export const useTerminations = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: TERMINATION_KEYS.list(tenantId, params),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<PaginatedResponse<ContractTerminationRequest>>('/contract-terminations', { params, tenantId })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_TERMINATIONS, meta: { page: 1, limit: 10, total: MOCK_TERMINATIONS.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_TERMINATIONS, meta: { page: 1, limit: 10, total: MOCK_TERMINATIONS.length, totalPages: 1 } }
      }
    },
    enabled: !!tenantId,
  })
}

export const useTermination = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: TERMINATION_KEYS.detail(tenantId, id),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ContractTerminationRequest>(`/contract-terminations/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mock = MOCK_TERMINATIONS.find(t => t.id === id)
          if (mock) return mock
        }
        throw error
      }
    },
    enabled: !!tenantId && !!id,
  })
}

export const useApproveTermination = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch(`/contract-terminations/${id}/approve`, {}, { tenantId })
      return data
    }
  })
}
