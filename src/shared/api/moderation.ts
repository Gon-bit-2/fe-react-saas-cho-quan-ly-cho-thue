import { AXIOS_INSTANCE } from './axios-client'

export type TReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
export type TReportTargetType = 'ROOM' | 'TENANT' | 'REVIEW' | 'USER'

export interface IReportDTO {
  id: number
  targetType: TReportTargetType
  targetId: string
  reason: string
  description?: string
  status: TReportStatus
  resolutionNote?: string
  reporterId: number
  handledBy?: number
  createdAt: string
  updatedAt: string
}

export interface IListAdminReportsQueryDTO {
  page?: number
  limit?: number
  status?: TReportStatus
  targetType?: TReportTargetType
  reporterId?: number
  handledBy?: number
  from?: string
  to?: string
  search?: string
}

export interface IUpdateReportStatusBodyDTO {
  status: 'REVIEWING' | 'RESOLVED' | 'REJECTED'
  resolutionNote?: string
}

export const reportsAdminApi = {
  list: async (params?: IListAdminReportsQueryDTO) => {
    const response = await AXIOS_INSTANCE.get<{ data: IReportDTO[]; total: number }>('/reports/admin', { params })
    return response.data
  },
  getById: async (id: number) => {
    const response = await AXIOS_INSTANCE.get<IReportDTO>(`/reports/admin/${id}`)
    return response.data
  },
  updateStatus: async (id: number, body: IUpdateReportStatusBodyDTO) => {
    const response = await AXIOS_INSTANCE.patch<IReportDTO>(`/reports/admin/${id}/status`, body)
    return response.data
  }
}
