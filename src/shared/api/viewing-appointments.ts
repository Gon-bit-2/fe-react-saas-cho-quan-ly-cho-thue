import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from './axios-client'
import { useAuth } from '@/shared/hooks/use-auth'
import type { Appointment, AppointmentStatus } from './generated/models'

interface AppointmentList {
  data: Appointment[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

const keys = {
  all: ['viewing-appointments'] as const,
  list: (tenantId: string, params: Record<string, unknown>) => ['viewing-appointments', tenantId, params] as const,
  detail: (tenantId: string, id: number) => ['viewing-appointments', tenantId, id] as const,
}

export function useViewingAppointments(
  params: { page?: number; limit?: number; status?: AppointmentStatus; search?: string } = {},
) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId ?? '')
  return useQuery({
    queryKey: keys.list(tenantId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<AppointmentList>('/room-viewing-appointments', { params, tenantId })
      return data
    },
    enabled: Boolean(tenantId),
  })
}

export function useViewingAppointmentForLandlord(id: number) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId ?? '')
  return useQuery({
    queryKey: keys.detail(tenantId, id),
    queryFn: async () => {
      const { data } = await apiClient.get<Appointment>(`/room-viewing-appointments/${id}`, { tenantId })
      return data
    },
    enabled: Boolean(tenantId && id),
  })
}

export function useUpdateViewingAppointmentStatus(id: number) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId ?? '')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      status: AppointmentStatus
      scheduledAt?: string
      assignedStaffId?: number | null
      landlordNote?: string | null
    }) => {
      const { data } = await apiClient.patch<Appointment>(`/room-viewing-appointments/${id}/status`, body, { tenantId })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all })
    },
  })
}

export function useAssignViewingAppointment(id: number) {
  const { selectedMembership } = useAuth()
  const tenantId = String(selectedMembership?.tenantId ?? '')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { staffId: number }) => {
      const { data } = await apiClient.patch<Appointment>(`/room-viewing-appointments/${id}/assign`, body, { tenantId })
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.all })
    },
  })
}
