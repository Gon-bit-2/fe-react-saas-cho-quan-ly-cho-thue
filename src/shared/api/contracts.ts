import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Contract, ListContractsQuery, CreateContractBody, UpdateContractBody } from '@/types/contract'
import type { AddContractMemberBodyDTO } from './generated/models/addContractMemberBodyDTO'

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
  const cleanParams = params.search ? params : { ...params, search: undefined }

  return useQuery({
    queryKey: CONTRACT_KEYS.list(tenantId, cleanParams),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Contract>>('/contracts', {
        params: cleanParams,
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateContractBody) => {
      const { data } = await apiClient.post<Contract>('/contracts', payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useUpdateContract = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateContractBody) => {
      const { data } = await apiClient.patch<Contract>(`/contracts/${id}`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useActivateContract = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch<Contract>(`/contracts/${id}/activate`, {}, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useCancelContract = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch<Contract>(`/contracts/${id}/cancel`, {}, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useAddContractMember = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddContractMemberBodyDTO) => {
      const { data } = await apiClient.post<Contract>(`/contracts/${id}/members`, payload, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useRemoveContractMember = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: number) => {
      const { data } = await apiClient.delete<Contract>(`/contracts/${id}/members/${memberId}`, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useSignContractLandlord = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (signature: string) => {
      const { data } = await apiClient.post<Contract>(`/contracts/${id}/sign-landlord`, { signature }, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}

export const useSignContractRenter = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (signature: string) => {
      const { data } = await apiClient.post<Contract>(`/contracts/me/${id}/sign`, { signature }, { tenantId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.detail(tenantId, id) })
      queryClient.invalidateQueries({ queryKey: CONTRACT_KEYS.lists(tenantId) })
    },
  })
}
