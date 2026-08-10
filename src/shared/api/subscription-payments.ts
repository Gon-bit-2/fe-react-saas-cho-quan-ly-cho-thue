import { AXIOS_INSTANCE } from './axios-client'

export type TPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export interface ISubscriptionPaymentDTO {
  id: number
  landlordId: number
  planId: number
  amount: number
  currency: string
  status: TPaymentStatus
  paymentMethod: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export interface IListSubscriptionPaymentsQueryDTO {
  page?: number
  limit?: number
  status?: TPaymentStatus
  planId?: number
  landlordId?: number
  from?: string
  to?: string
}

export const subscriptionPaymentsApi = {
  list: async (params?: IListSubscriptionPaymentsQueryDTO) => {
    const response = await AXIOS_INSTANCE.get<{ data: ISubscriptionPaymentDTO[]; total: number }>('/subscription-payments', { params })
    return response.data
  },
  getById: async (id: number) => {
    const response = await AXIOS_INSTANCE.get<ISubscriptionPaymentDTO>(`/subscription-payments/${id}`)
    return response.data
  }
}
