import { AXIOS_INSTANCE } from './axios-client'

export interface IAmenityDTO {
  id: number
  name: string
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface IListAmenitiesQueryDTO {
  page?: number
  limit?: number
  search?: string
}

export interface ICreateAmenityBodyDTO {
  name: string
  description?: string
  icon?: string
}

export type IUpdateAmenityBodyDTO = Partial<ICreateAmenityBodyDTO>

export const amenitiesApi = {
  list: async (params?: IListAmenitiesQueryDTO) => {
    const response = await AXIOS_INSTANCE.get<{ data: IAmenityDTO[]; total: number }>('/amenities', { params })
    return response.data
  },
  create: async (body: ICreateAmenityBodyDTO) => {
    const response = await AXIOS_INSTANCE.post<IAmenityDTO>('/amenities', body)
    return response.data
  },
  update: async (id: number, body: IUpdateAmenityBodyDTO) => {
    const response = await AXIOS_INSTANCE.patch<IAmenityDTO>(`/amenities/${id}`, body)
    return response.data
  }
}
