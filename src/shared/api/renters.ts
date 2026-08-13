import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Renter, RenterInvitation, ListRentersQuery, InviteRenterBody, UpdateRenterForLandlordBody } from '@/types/renter'

const RENTER_KEYS = {
  all: ['renters'] as const,
  lists: (tenantId: string) => [...RENTER_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: ListRentersQuery) => [...RENTER_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...RENTER_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...RENTER_KEYS.details(tenantId), id] as const,
  roommates: (tenantId: string, renterId: number) => [...RENTER_KEYS.detail(tenantId, renterId), 'roommates'] as const,
  invitationDetail: (tenantId: string, id: number | string) => [...RENTER_KEYS.all, 'invitation', tenantId, id] as const,
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
  const cleanParams = params.search ? params : { ...params, search: undefined }

  return useQuery({
    queryKey: RENTER_KEYS.list(tenantId, cleanParams),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Renter>>('/renters', {
        params: cleanParams,
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: InviteRenterBody) => {
      const { data } = await apiClient.post<RenterInvitation>('/renters/invitations', payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RENTER_KEYS.lists(tenantId) })
    },
  })
}

export const useUpdateRenter = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateRenterForLandlordBody) => {
      const { data } = await apiClient.patch<Renter>(`/renters/${id}`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RENTER_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: RENTER_KEYS.lists(tenantId) })
    },
  })
}

export const getInvitation = async (tenantId: string, id: number | string) => {
  const { data } = await apiClient.get<RenterInvitation>(`/renters/invitations/${id}`, {
    tenantId,
  })
  return data
}

export const useRenterInvitation = (id: number | string) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: RENTER_KEYS.invitationDetail(tenantId, id),
    queryFn: () => getInvitation(tenantId, id),
    enabled: !!tenantId && !!id,
  })
}
