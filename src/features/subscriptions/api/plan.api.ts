import { apiClient } from '@/shared/api/axios-client'

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface Plan {
  id: number | string
  name: string
  description?: string
  priceMonthly: number
  priceYearly: number
  billingCycle: 'MONTHLY' | 'YEARLY'
  features: string[]
  maxProperties: number
  maxRooms: number
  maxStaff: number
  allowAiOcr: boolean
  allowWebhookPayment: boolean
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
  startedAt: string
  expiredAt: string
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

export interface SubscriptionResponse {
  subscription: Subscription
  pendingPayment: PaymentTransaction | null
  usageLimits: {
    currentProperties: number
    currentStorageGb: number
    currentStaff: number
    currentRooms: number
  }
}

export const planApi = {
  getPlans: () => {
    return apiClient.get<Plan[]>('/plans')
  },
  getCurrentSubscription: (tenantId: number) => {
    return apiClient.get<SubscriptionResponse>(`/subscriptions/me`, { headers: { 'x-tenant-id': tenantId } })
  },
  checkoutPlan: (tenantId: number, data: { planId: number; billingCycle: string }) => {
    return apiClient.post<{ checkoutUrl: string }>(`/subscriptions/checkout`, data, { headers: { 'x-tenant-id': tenantId } })
  },
  getPaymentHistory: (tenantId: number) => {
    return apiClient.get<PaginatedResponse<PaymentTransaction>>(`/subscription-payments/me`, { headers: { 'x-tenant-id': tenantId } })
  },
}
