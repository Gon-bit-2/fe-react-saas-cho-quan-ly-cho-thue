import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Contract, ListContractsQuery, CreateContractBody, UpdateContractBody } from '@/types/contract'

// Mock Data
export const MOCK_CONTRACTS: Contract[] = [
  {
    id: 1,
    roomId: 201,
    renterId: 101,
    contractCode: 'HD-2026-08-001',
    startDate: '2026-08-01',
    endDate: '2027-08-01',
    monthlyPrice: 5000000,
    depositAmount: 5000000,
    billingCycle: 'MONTHLY',
    paymentDueDay: 5,
    contentSnapshot: 'Nội dung hợp đồng...',
    status: 'ACTIVE',
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-07-28T10:00:00Z',
  },
  {
    id: 2,
    roomId: 202,
    renterId: 102,
    contractCode: 'HD-2026-08-002',
    startDate: '2026-08-15',
    endDate: '2027-08-15',
    monthlyPrice: 4500000,
    depositAmount: 4500000,
    billingCycle: 'MONTHLY',
    paymentDueDay: 15,
    contentSnapshot: 'Nội dung hợp đồng...',
    status: 'DRAFT',
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
  }
]

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
      try {
        const { data } = await apiClient.get<PaginatedResponse<Contract>>('/contracts', {
          params,
          tenantId,
        })
        if (!data.data || data.data.length === 0) {
          return {
            data: MOCK_CONTRACTS,
            meta: { page: 1, limit: 10, total: MOCK_CONTRACTS.length, totalPages: 1 },
          }
        }
        return data
      } catch {
        return {
          data: MOCK_CONTRACTS,
          meta: { page: 1, limit: 10, total: MOCK_CONTRACTS.length, totalPages: 1 },
        }
      }
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
      try {
        const { data } = await apiClient.get<Contract>(`/contracts/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        // Fallback for demo
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mock = MOCK_CONTRACTS.find((r) => r.id === id)
          if (mock) return mock
        }
        throw error
      }
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
