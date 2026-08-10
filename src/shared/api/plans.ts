import { AXIOS_INSTANCE } from './axios-client'

export type TPlanStatus = 'ACTIVE' | 'INACTIVE'
export interface IPlanDTO {
  id: number
  name: string
  price: number
  currency: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  maxProperties: number | null
  maxRooms: number | null
  maxManagers: number | null
  maxStorageGb: number | null
  status: TPlanStatus
  createdAt: string
  updatedAt: string
}

export interface IListPlansQueryDTO {
  page?: number
  limit?: number
  search?: string
  status?: TPlanStatus
}

export interface ICreatePlanBodyDTO {
  name: string
  price: number
  currency?: string
  billingCycle: 'MONTHLY' | 'YEARLY'
  maxProperties?: number | null
  maxRooms?: number | null
  maxManagers?: number | null
  maxStorageGb?: number | null
  status?: TPlanStatus
}

export type IUpdatePlanBodyDTO = Partial<ICreatePlanBodyDTO>

export const plansApi = {
  list: async (params?: IListPlansQueryDTO) => {
    const response = await AXIOS_INSTANCE.get<{ data: IPlanDTO[]; total: number }>('/plans', { params })
    return response.data
  },
  listAvailable: async () => {
    const response = await AXIOS_INSTANCE.get<IPlanDTO[]>('/plans/available')
    return response.data
  },
  getById: async (id: number) => {
    const response = await AXIOS_INSTANCE.get<IPlanDTO>(`/plans/${id}`)
    return response.data
  },
  create: async (body: ICreatePlanBodyDTO) => {
    const response = await AXIOS_INSTANCE.post<IPlanDTO>('/plans', body)
    return response.data
  },
  update: async (id: number, body: IUpdatePlanBodyDTO) => {
    const response = await AXIOS_INSTANCE.patch<IPlanDTO>(`/plans/${id}`, body)
    return response.data
  }
}
