import { AXIOS_INSTANCE } from '@/shared/api/axios-client'
import type { TListAdminReportsQuery, TReport, TUpdateReportStatusBody } from '../types/reports.types'



export const reportsAdminApi = {
  list: async (params?: TListAdminReportsQuery) => {
    const response = await AXIOS_INSTANCE.get<{ data: TReport[]; total: number }>('/reports/admin', { params })
    return response.data || { data: [], total: 0 }
  },
  
  getById: async (id: number) => {
    const response = await AXIOS_INSTANCE.get<TReport>(`/reports/admin/${id}`)
    return response.data
  },
  
  updateStatus: async (id: number, body: TUpdateReportStatusBody) => {
    const response = await AXIOS_INSTANCE.patch<TReport>(`/reports/admin/${id}/status`, body)
    return response.data
  }
}
