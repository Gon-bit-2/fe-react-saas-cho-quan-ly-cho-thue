import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { ContractTerminationRequest } from '@/types/termination'



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
      const { data } = await apiClient.get<PaginatedResponse<ContractTerminationRequest>>('/contract-terminations', { params, tenantId })
      return data
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
      const { data } = await apiClient.get<ContractTerminationRequest>(`/contract-terminations/${id}`, { tenantId })
      return data
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
