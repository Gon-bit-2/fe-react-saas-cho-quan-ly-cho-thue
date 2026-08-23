import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/shared/types/errors'
import { apiClient } from './axios-client'

export interface RegisterTenantBody {
  tenantName: string
  taxCode?: string
  tenantPhone?: string
  tenantEmail?: string
  address?: string
}

export const tenantsApi = {
  /**
   * Tạo một Tenant (Tổ chức/Nhà trọ) cho người dùng hiện tại đang đăng nhập.
   */
  register: async (data: RegisterTenantBody) => {
    const response = await apiClient.post('/tenants/register', data)
    return response.data
  },
}

export const useRegisterTenant = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, RegisterTenantBody>({
    mutationFn: tenantsApi.register,
  })
}
