import { apiClient } from '@/shared/api/axios-client'

export interface Plan {
  id: number | string
  name: string
  description?: string
  price: number
  billingCycle: 'MONTHLY' | 'YEARLY'
  features: string[]
  maxProperties: number
  maxRooms?: number
  maxUsers?: number
  storageLimitGb?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Subscription {
  id: number | string
  tenantId: number | string
  planId: number | string
  plan?: Plan
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'PENDING'
  billingCycle?: 'MONTHLY' | 'YEARLY'
  startDate: string
  endDate: string
  nextBillingDate?: string
  autoRenew: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PaymentTransaction {
  id: number
  tenantId: number
  subscriptionId: number
  amount: number
  currency: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  paymentMethod: 'PAYOS' | 'BANK_TRANSFER'
  transactionId?: string
  checkoutUrl?: string
  createdAt: string
  updatedAt: string
}

export const planApi = {
  getPlans: () => {
    return apiClient.get<Plan[]>('/plans')
  },
  getCurrentSubscription: (tenantId: number) => {
    return apiClient.get<Subscription>(`/tenants/${tenantId}/subscriptions/current`)
  },
  checkoutPlan: (tenantId: number, data: { planId: number; billingCycle: string }) => {
    return apiClient.post<{ checkoutUrl: string }>(`/tenants/${tenantId}/subscription-payments/checkout`, data)
  },
  getPaymentHistory: (tenantId: number) => {
    return apiClient.get<PaymentTransaction[]>(`/tenants/${tenantId}/subscription-payments`)
  },
}
