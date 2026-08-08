import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Renter, ListRentersQuery, InviteRenterBody } from '@/types/renter'

// Mock Data
export const MOCK_RENTERS: Renter[] = [
  {
    id: 1,
    userId: 101,
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0987654321',
    dateOfBirth: '1995-05-20',
    gender: 'MALE',
    identityNumber: '001095001234',
    permanentAddress: '123 Đường B, Phường C, Quận D, TP HCM',
    occupation: 'Nhân viên IT',
    emergencyContactName: 'Nguyễn Thị E',
    emergencyContactPhone: '0911222333',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    userId: 102,
    fullName: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0912345678',
    verificationStatus: 'PENDING',
    createdAt: '2026-08-05T14:30:00Z',
    updatedAt: '2026-08-05T14:30:00Z',
  },
]

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
      try {
        const { data } = await apiClient.get<PaginatedResponse<Renter>>('/renters', {
          params,
          tenantId,
        })
        if (!data.data || data.data.length === 0) {
          return {
            data: MOCK_RENTERS,
            meta: { page: 1, limit: 10, total: MOCK_RENTERS.length, totalPages: 1 },
          }
        }
        return data
      } catch {
        return {
          data: MOCK_RENTERS,
          meta: { page: 1, limit: 10, total: MOCK_RENTERS.length, totalPages: 1 },
        }
      }
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
      try {
        const { data } = await apiClient.get<Renter>(`/renters/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) { // Fallback for demo
          const mock = MOCK_RENTERS.find((r) => r.id === id)
          if (mock) return mock
        }
        throw error
      }
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
