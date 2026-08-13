import { apiClient } from './axios-client'
import type { PaginatedResponse } from '@/features/tenant-app/types'

export interface IPlanDTO {
  id: number
  code: string
  name: string
  description?: string | null
  priceMonthly: number
  priceYearly: number
  maxRooms: number
  maxStaff: number
  allowAiOcr: boolean
  allowWebhookPayment: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IListPlansQueryDTO {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface ICreatePlanBodyDTO {
  code: string
  name: string
  description?: string
  priceMonthly: number
  priceYearly: number
  maxRooms: number
  maxStaff: number
  allowAiOcr?: boolean
  allowWebhookPayment?: boolean
  isActive?: boolean
}

export type IUpdatePlanBodyDTO = Partial<Omit<ICreatePlanBodyDTO, 'code'>>

export const plansApi = {
  list: async (params?: IListPlansQueryDTO) => {
    const cleanParams = params?.search ? params : params ? { ...params, search: undefined } : undefined
    const response = await apiClient.get<PaginatedResponse<IPlanDTO>>('/plans', { params: cleanParams })
    return response.data
  },
  listAvailable: async () => {
    const response = await apiClient.get<IPlanDTO[]>('/plans/available')
    return response.data
  },
  getById: async (id: number) => {
    const response = await apiClient.get<IPlanDTO>(`/plans/${id}`)
    return response.data
  },
  create: async (body: ICreatePlanBodyDTO) => {
    const response = await apiClient.post<IPlanDTO>('/plans', body)
    return response.data
  },
  update: async (id: number, body: IUpdatePlanBodyDTO) => {
    const response = await apiClient.patch<IPlanDTO>(`/plans/${id}`, body)
    return response.data
  }
}
