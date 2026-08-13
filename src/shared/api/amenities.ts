import { apiClient } from './axios-client'
import type { PaginatedResponse } from '@/features/tenant-app/types'

export interface IAmenityDTO {
  id: number
  name: string
  category: string
  icon?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IListAmenitiesQueryDTO {
  page?: number
  limit?: number
  search?: string
  category?: string
  isActive?: boolean
}

export interface ICreateAmenityBodyDTO {
  name: string
  category: string
  icon?: string | null
  isActive?: boolean
}

export type IUpdateAmenityBodyDTO = Partial<ICreateAmenityBodyDTO>

export const amenitiesApi = {
  list: async (params?: IListAmenitiesQueryDTO) => {
    const cleanParams = params?.search ? params : params ? { ...params, search: undefined } : undefined
    const response = await apiClient.get<PaginatedResponse<IAmenityDTO>>('/amenities', { params: cleanParams })
    return response.data
  },
  create: async (body: ICreateAmenityBodyDTO) => {
    const response = await apiClient.post<IAmenityDTO>('/amenities', body)
    return response.data
  },
  update: async (id: number, body: IUpdateAmenityBodyDTO) => {
    const response = await apiClient.patch<IAmenityDTO>(`/amenities/${id}`, body)
    return response.data
  }
}
