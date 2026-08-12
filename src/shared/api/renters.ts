import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Renter, ListRentersQuery, InviteRenterBody } from '@/types/renter'



const RENTER_KEYS = {
  all: ['renters'] as const,
  lists: (tenantId: string) => [...RENTER_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: ListRentersQuery) => [...RENTER_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...RENTER_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...RENTER_KEYS.details(tenantId), id] as const,
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

export const useRenters = (params: ListRentersQuery = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: RENTER_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Renter>>('/renters', {
        params,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useRenter = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: RENTER_KEYS.detail(tenantId, id),
    queryFn: async () => {
      const { data } = await apiClient.get<Renter>(`/renters/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useCreateRenterInvite = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useMutation({
    mutationFn: async (payload: InviteRenterBody) => {
      const { data } = await apiClient.post('/renters/invite', payload, { tenantId })
      return data
    }
  })
}
