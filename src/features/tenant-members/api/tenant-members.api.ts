import { apiClient } from '@/shared/api/axios-client'
import type { AddTenantMemberPayload, Role, TenantMember, UpdateTenantMemberRolePayload } from '../types'

export const tenantMembersApi = {
  getAssignableRoles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>('/roles/tenant-assignable')
    return data
  },

  getTenantMembers: async (): Promise<TenantMember[]> => {
    const { data } = await apiClient.get<TenantMember[]>('/tenant-members')
    return data
  },

  addTenantMember: async (payload: AddTenantMemberPayload): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/tenant-members', payload)
    return data
  },

  updateMemberRole: async (id: number, payload: UpdateTenantMemberRolePayload): Promise<TenantMember> => {
    const { data } = await apiClient.patch<TenantMember>(`/tenant-members/${id}/role`, payload)
    return data
  },

  removeTenantMember: async (id: number): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(`/tenant-members/${id}`)
    return data
  },
}
