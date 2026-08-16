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
  price: number
  billingCycle: 'MONTHLY'
  maxProperties: number
  maxManagers: number
  maxStorageGb: number
  status: 'ACTIVE' | 'INACTIVE'
}

type PlanApiDTO = Omit<IPlanDTO, 'price' | 'billingCycle' | 'maxManagers' | 'status'>

const normalizePlan = (plan: PlanApiDTO): IPlanDTO => ({
  ...plan,
  price: plan.priceMonthly,
  billingCycle: 'MONTHLY',
  maxProperties: plan.maxProperties,
  maxManagers: plan.maxStaff,
  maxStorageGb: plan.maxStorageGb,
  status: plan.isActive ? 'ACTIVE' : 'INACTIVE',
})

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
  maxProperties?: number
  maxRooms: number
  maxStaff: number
  maxStorageGb?: number
  allowAiOcr?: boolean
  allowWebhookPayment?: boolean
  isActive?: boolean
}

export type IUpdatePlanBodyDTO = Partial<Omit<ICreatePlanBodyDTO, 'code'>>

export const plansApi = {
  list: async (params?: IListPlansQueryDTO) => {
    const cleanParams = params?.search ? params : params ? { ...params, search: undefined } : undefined
    const response = await apiClient.get<PaginatedResponse<PlanApiDTO>>('/plans', { params: cleanParams })
    return { ...response.data, data: response.data.data.map(normalizePlan) }
  },
  listAvailable: async () => {
    const response = await apiClient.get<PlanApiDTO[]>('/plans/available')
    return response.data.map(normalizePlan)
  },
  getById: async (id: number) => {
    const response = await apiClient.get<PlanApiDTO>(`/plans/${id}`)
    return normalizePlan(response.data)
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
