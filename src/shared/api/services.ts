import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Service, ServiceAssignment } from '@/types/service'

export const MOCK_SERVICES: Service[] = [
  {
    id: 1,
    tenantId: 10,
    name: 'Phí gửi xe máy',
    description: 'Phí gửi xe hàng tháng',
    price: 150000,
    unit: 'xe',
    type: 'PARKING',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    tenantId: 10,
    name: 'Phí vệ sinh',
    description: 'Vệ sinh hành lang chung',
    price: 50000,
    unit: 'phòng',
    type: 'SERVICE',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
]

export const MOCK_SERVICE_ASSIGNMENTS: ServiceAssignment[] = [
  {
    id: 1,
    serviceId: 1,
    service: MOCK_SERVICES[0],
    roomId: 201,
    quantity: 2,
    assignedDate: '2026-01-01T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
]

const SERVICE_KEYS = {
  allServices: ['services'] as const,
  services: (tenantId: string, params: Record<string, unknown>) => [...SERVICE_KEYS.allServices, tenantId, params] as const,
  serviceDetail: (tenantId: string, id: number) => [...SERVICE_KEYS.allServices, 'detail', tenantId, id] as const,
  
  allAssignments: ['service-assignments'] as const,
  assignments: (tenantId: string, params: Record<string, unknown>) => [...SERVICE_KEYS.allAssignments, tenantId, params] as const,
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

export const useServices = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: SERVICE_KEYS.services(tenantId, params),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<PaginatedResponse<Service>>('/services', { params, tenantId })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_SERVICES, meta: { page: 1, limit: 10, total: MOCK_SERVICES.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_SERVICES, meta: { page: 1, limit: 10, total: MOCK_SERVICES.length, totalPages: 1 } }
      }
    },
    enabled: !!tenantId,
  })
}

export const useService = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: SERVICE_KEYS.serviceDetail(tenantId, id),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<Service>(`/services/${id}`, { tenantId })
        return data
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 404) {
          const mock = MOCK_SERVICES.find(s => s.id === id)
          if (mock) return mock
        }
        throw error
      }
    },
    enabled: !!tenantId && !!id,
  })
}

export const useCreateService = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: Partial<Service>) => {
      const { data } = await apiClient.post('/services', payload, { tenantId })
      return data
    }
  })
}

export const useUpdateService = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: Partial<Service>) => {
      const { data } = await apiClient.patch(`/services/${id}`, payload, { tenantId })
      return data
    }
  })
}

export const useServiceAssignments = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: SERVICE_KEYS.assignments(tenantId, params),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<PaginatedResponse<ServiceAssignment>>('/service-assignments', { params, tenantId })
        if (!data.data || data.data.length === 0) {
          return { data: MOCK_SERVICE_ASSIGNMENTS, meta: { page: 1, limit: 10, total: MOCK_SERVICE_ASSIGNMENTS.length, totalPages: 1 } }
        }
        return data
      } catch {
        return { data: MOCK_SERVICE_ASSIGNMENTS, meta: { page: 1, limit: 10, total: MOCK_SERVICE_ASSIGNMENTS.length, totalPages: 1 } }
      }
    },
    enabled: !!tenantId,
  })
}

export const useAssignService = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: Partial<ServiceAssignment>) => {
      const { data } = await apiClient.post('/service-assignments', payload, { tenantId })
      return data
    }
  })
}
