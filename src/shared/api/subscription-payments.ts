import { apiClient } from './axios-client'
import type { PaginatedResponse } from '@/features/tenant-app/types'

export type TSubscriptionPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED' | 'EXPIRED'
export type TSubscriptionPaymentPurpose = 'RENEWAL' | 'PLAN_CHANGE'
export type TBillingCycle = 'MONTHLY' | 'YEARLY'

export interface ISubscriptionPaymentDTO {
  id: number
  tenantId: number
  planId: number
  amount: number
  status: TSubscriptionPaymentStatus
  purpose: TSubscriptionPaymentPurpose
  billingCycle: TBillingCycle
  payosOrderCode?: number | null
  checkoutUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface IListSubscriptionPaymentsQueryDTO {
  page?: number
  limit?: number
  tenantId?: number
  subscriptionId?: number
  planId?: number
  status?: TSubscriptionPaymentStatus
  purpose?: TSubscriptionPaymentPurpose
  from?: string
  to?: string
  search?: string
}

export interface ICreateCheckoutBodyDTO {
  planId: number
  billingCycle: TBillingCycle
}

export const subscriptionPaymentsApi = {
  list: async (params?: IListSubscriptionPaymentsQueryDTO) => {
    const cleanParams = params?.search ? params : params ? { ...params, search: undefined } : undefined
    const response = await apiClient.get<PaginatedResponse<ISubscriptionPaymentDTO>>('/subscription-payments', { params: cleanParams })
    return response.data
  },
  getById: async (id: number) => {
    const response = await apiClient.get<ISubscriptionPaymentDTO>(`/subscription-payments/${id}`)
    return response.data
  },
  listMine: async (params?: { page?: number; limit?: number; status?: TSubscriptionPaymentStatus; purpose?: TSubscriptionPaymentPurpose; from?: string; to?: string }) => {
    const response = await apiClient.get<PaginatedResponse<ISubscriptionPaymentDTO>>('/subscription-payments/me', { params })
    return response.data
  },
  createCheckout: async (body: ICreateCheckoutBodyDTO) => {
    const response = await apiClient.post<{ checkoutUrl: string }>('/subscription-payments/me/payos', body)
    return response.data
  },
  cancelMine: async (id: number) => {
    const response = await apiClient.post<ISubscriptionPaymentDTO>(`/subscription-payments/me/${id}/cancel`)
    return response.data
  }
}
