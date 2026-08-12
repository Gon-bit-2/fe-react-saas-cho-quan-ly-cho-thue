import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Contract, ListContractsQuery, CreateContractBody, UpdateContractBody } from '@/types/contract'



const CONTRACT_KEYS = {
  all: ['contracts'] as const,
  lists: (tenantId: string) => [...CONTRACT_KEYS.all, 'list', tenantId] as const,
  list: (tenantId: string, params: ListContractsQuery) => [...CONTRACT_KEYS.lists(tenantId), params] as const,
  details: (tenantId: string) => [...CONTRACT_KEYS.all, 'detail', tenantId] as const,
  detail: (tenantId: string, id: number) => [...CONTRACT_KEYS.details(tenantId), id] as const,
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

export const useContracts = (params: ListContractsQuery = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: CONTRACT_KEYS.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Contract>>('/contracts', {
        params,
        tenantId,
      })
      return data
    },
    enabled: !!tenantId,
  })
}

export const useContract = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: CONTRACT_KEYS.detail(tenantId, id),
    queryFn: async () => {
      const { data } = await apiClient.get<Contract>(`/contracts/${id}`, { tenantId })
      return data
    },
    enabled: !!tenantId && !!id,
  })
}

export const useCreateContract = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useMutation({
    mutationFn: async (payload: CreateContractBody) => {
      const { data } = await apiClient.post('/contracts', payload, { tenantId })
      return data
    }
  })
}

export const useUpdateContract = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useMutation({
    mutationFn: async (payload: UpdateContractBody) => {
      const { data } = await apiClient.patch(`/contracts/${id}`, payload, { tenantId })
      return data
    }
  })
}
