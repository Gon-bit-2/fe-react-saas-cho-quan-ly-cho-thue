import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '../hooks/use-auth'
import type { Service, ServiceAssignment } from '@/types/service'



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
      const { data } = await apiClient.get<PaginatedResponse<Service>>('/services', { params, tenantId })
      return data
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
      const { data } = await apiClient.get<Service>(`/services/${id}`, { tenantId })
      return data
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
      const { data } = await apiClient.get<PaginatedResponse<ServiceAssignment>>('/service-assignments', { params, tenantId })
      return data
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
