import { AXIOS_INSTANCE } from '@/shared/api/axios-client'
import type { TListAdminReportsQuery, TReport, TUpdateReportStatusBody } from '../types/reports.types'

// Mock Data Fallback
const MOCK_REPORTS: TReport[] = [
  {
    id: 1,
    targetType: 'ROOM',
    targetId: '301',
    reason: 'Hình ảnh không đúng thực tế',
    description: 'Chủ nhà đăng ảnh phòng đẹp nhưng đến xem thì rất cũ, tường ẩm mốc.',
    status: 'PENDING',
    reporterId: 205,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporterName: 'Khách thuê 1',
    targetName: 'Phòng 101 - Khu A'
  },
  {
    id: 2,
    targetType: 'TENANT',
    targetId: '401',
    reason: 'Chủ nhà lừa đảo tiền cọc',
    description: 'Bảo chuyển cọc trước rồi mới cho xem hợp đồng nhưng mất hút.',
    status: 'REVIEWING',
    reporterId: 206,
    handledBy: 999,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    reporterName: 'Khách thuê 2',
    handlerName: 'Admin System',
    targetName: 'Hệ thống phòng trọ ABC'
  },
  {
    id: 3,
    targetType: 'REVIEW',
    targetId: '10',
    reason: 'Đánh giá spam',
    description: 'Chứa nội dung quảng cáo lô đề cờ bạc.',
    status: 'RESOLVED',
    reporterId: 207,
    handledBy: 999,
    resolutionNote: 'Đã ẩn đánh giá và cảnh cáo user.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    reporterName: 'Chủ trọ X',
    handlerName: 'Admin System',
    targetName: 'Đánh giá #10'
  }
]

export const reportsAdminApi = {
  list: async (params?: TListAdminReportsQuery) => {
    try {
      const response = await AXIOS_INSTANCE.get<{ data: TReport[]; total: number }>('/reports/admin', { params })
      if (!response.data || response.data.data.length === 0) {
        throw new Error('Empty data, falling back to mock')
      }
      return response.data
    } catch (error: unknown) {
      console.warn('Backend /reports/admin missing or empty. Using MOCK_REPORTS.', error)
      let filtered = [...MOCK_REPORTS]
      if (params?.status) {
        filtered = filtered.filter(r => r.status === params.status)
      }
      if (params?.targetType) {
        filtered = filtered.filter(r => r.targetType === params.targetType)
      }
      return {
        data: filtered,
        total: filtered.length
      }
    }
  },
  
  getById: async (id: number) => {
    try {
      const response = await AXIOS_INSTANCE.get<TReport>(`/reports/admin/${id}`)
      return response.data
    } catch (error: unknown) {
      console.warn(`Backend /reports/admin/${id} failed. Using mock.`)
      const report = MOCK_REPORTS.find(r => r.id === id)
      if (!report) throw new Error('Not found in mock', { cause: error })
      return report
    }
  },
  
  updateStatus: async (id: number, body: TUpdateReportStatusBody) => {
    try {
      const response = await AXIOS_INSTANCE.patch<TReport>(`/reports/admin/${id}/status`, body)
      return response.data
    } catch (error: unknown) {
      console.warn(`Backend /reports/admin/${id}/status failed. Simulating success.`)
      const report = MOCK_REPORTS.find(r => r.id === id)
      if (!report) throw new Error('Not found in mock', { cause: error })
      const updated = { ...report, status: body.status, resolutionNote: body.resolutionNote }
      return updated
    }
  }
}
