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

interface ServiceCatalogItemDto {
  id: number
  tenantId: number
  code: string
  name: string
  description?: string | null
  itemType: Service['type']
  defaultUnitPrice: number | string
  unitLabel: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceAssignmentDto {
  id: number
  serviceItemId: number
  serviceItem?: ServiceCatalogItemDto
  roomId?: number | null
  contractId?: number | null
  quantity: number | string
  startsAt?: string | null
  createdAt: string
  updatedAt: string
}

type ServiceInput = Pick<Service, 'code' | 'name' | 'price' | 'unit' | 'type'> &
  Partial<Pick<Service, 'description' | 'status'>>

type ServiceAssignmentInput = Pick<ServiceAssignment, 'serviceId' | 'quantity'> &
  Partial<Pick<ServiceAssignment, 'roomId' | 'contractId'>>

const mapService = (item: ServiceCatalogItemDto): Service => ({
  id: item.id,
  tenantId: item.tenantId,
  code: item.code,
  name: item.name,
  description: item.description ?? undefined,
  price: Number(item.defaultUnitPrice),
  unit: item.unitLabel,
  type: item.itemType,
  status: item.isActive ? 'ACTIVE' : 'INACTIVE',
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

const toServicePayload = (payload: Partial<ServiceInput>) => ({
  ...(payload.code === undefined ? {} : { code: payload.code }),
  ...(payload.name === undefined ? {} : { name: payload.name }),
  ...(payload.description === undefined ? {} : { description: payload.description }),
  ...(payload.type === undefined ? {} : { itemType: payload.type }),
  ...(payload.price === undefined ? {} : { defaultUnitPrice: payload.price }),
  ...(payload.unit === undefined ? {} : { unitLabel: payload.unit }),
  ...(payload.status === undefined ? {} : { isActive: payload.status === 'ACTIVE' }),
})

export const useServices = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: SERVICE_KEYS.services(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ServiceCatalogItemDto>>('/service-catalog', {
        params,
        tenantId,
      })
      return { ...data, data: data.data.map(mapService) }
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
      const { data } = await apiClient.get<PaginatedResponse<ServiceCatalogItemDto>>('/service-catalog', {
        params: { page: 1, limit: 100 },
        tenantId,
      })
      const item = data.data.find((service) => service.id === id)
      if (!item) throw new Error('Không tìm thấy dịch vụ')
      return mapService(item)
    },
    enabled: !!tenantId && !!id,
  })
}

export const useCreateService = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: ServiceInput) => {
      const { data } = await apiClient.post<ServiceCatalogItemDto>('/service-catalog', toServicePayload(payload), {
        tenantId,
      })
      return mapService(data)
    },
  })
}

export const useUpdateService = (id: number) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: Partial<ServiceInput>) => {
      const { data } = await apiClient.patch<ServiceCatalogItemDto>(
        `/service-catalog/${id}`,
        toServicePayload(payload),
        { tenantId },
      )
      return mapService(data)
    },
  })
}

export const useServiceAssignments = (params: Record<string, unknown> = {}) => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')

  return useQuery({
    queryKey: SERVICE_KEYS.assignments(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ServiceAssignmentDto>>('/service-assignments', {
        params,
        tenantId,
      })
      return {
        ...data,
        data: data.data.map((item) => ({
          id: item.id,
          serviceId: item.serviceItemId,
          service: item.serviceItem ? mapService(item.serviceItem) : undefined,
          roomId: item.roomId ?? undefined,
          contractId: item.contractId ?? undefined,
          quantity: Number(item.quantity),
          assignedDate: item.startsAt ?? item.createdAt,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      }
    },
    enabled: !!tenantId,
  })
}

export const useAssignService = () => {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId || '')
  return useMutation({
    mutationFn: async (payload: ServiceAssignmentInput) => {
      const { data } = await apiClient.post(
        '/service-assignments',
        {
          serviceItemId: payload.serviceId,
          roomId: payload.roomId || null,
          contractId: payload.contractId || null,
          quantity: payload.quantity,
          isActive: true,
        },
        { tenantId },
      )
      return data
    },
  })
}
