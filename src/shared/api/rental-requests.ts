import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { ListRentalRequestsQuery, RentalRequest } from '@/types/rental-request'

const RENTAL_REQUEST_KEYS = {
  all: ['rental-requests'] as const,
  lists: (tenantId: string) => [...RENTAL_REQUEST_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: ListRentalRequestsQuery) => [...RENTAL_REQUEST_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...RENTAL_REQUEST_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...RENTAL_REQUEST_KEYS.details(tenantId), id] as const,
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

export const useRentalRequests = (params: ListRentalRequestsQuery = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: RENTAL_REQUEST_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<RentalRequest>>('/rental-requests', {
        params,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useRentalRequest = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: RENTAL_REQUEST_KEYS.detail(tenantId, id),
    queryFn: async () => {
      const { data } = await apiClient.get<RentalRequest>(`/rental-requests/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useUpdateRentalRequestDecision = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useMutation({
    mutationFn: async ({ id, decision, reason }: { id: number, decision: 'APPROVED' | 'REJECTED' | 'NEED_MORE_INFO', reason?: string }) => {
      const { data } = await apiClient.patch(`/rental-requests/${id}/decision`, { decision, reason }, { tenantId })
      return data
    }
  })
}
