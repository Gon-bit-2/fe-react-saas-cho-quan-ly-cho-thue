import { apiClient } from '@/shared/api/axios-client'
import type { TicketSummary, TicketDetail, TicketComment, TicketStatus, TicketCategory, TicketPriority, TicketAttachment } from './types'

export interface GetTicketsParams {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  roomId?: number
  contractId?: number
  search?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const ticketApi = {
  /** Lấy danh sách ticket */
  getTickets: async (params?: GetTicketsParams) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketSummary>>('/tickets', { params })
    return data
  },

  /** Lấy chi tiết ticket */
  getTicketById: async (id: number) => {
    const { data } = await apiClient.get<TicketDetail>(`/tickets/${id}`)
    return data
  },

  /** Lấy danh sách bình luận của ticket */
  getTicketComments: async (id: number) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketComment> | TicketComment[]>(`/tickets/${id}/comments`)
    return Array.isArray(data) ? data : data.data
  },

  /** Lấy danh sách ticket của tôi (Renter) */
  getMyTickets: async (params?: GetTicketsParams) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketSummary>>('/tickets/me', { params })
    return data
  },

  /** Lấy chi tiết ticket của tôi */
  getMyTicketById: async (id: number) => {
    const { data } = await apiClient.get<TicketDetail>(`/tickets/me/${id}`)
    return data
  },

  /** Lấy bình luận ticket của tôi */
  getMyTicketComments: async (id: number) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketComment> | TicketComment[]>(`/tickets/me/${id}/comments`)
    return Array.isArray(data) ? data : data.data
  },

  /** Tạo bình luận mới */
  createComment: async (id: number, content: string, isInternal: boolean = false) => {
    const { data } = await apiClient.post<TicketComment>(`/tickets/${id}/comments`, { message: content, isInternal })
    return data
  },

  /** Đổi trạng thái ticket */
  updateTicketStatus: async (id: number, status: TicketStatus) => {
    const { data } = await apiClient.patch<TicketDetail>(`/tickets/${id}/status`, { status })
    return data
  },

  /** Phân công người xử lý */
  assignTicket: async (id: number, assignedTo: number | null) => {
    const { data } = await apiClient.patch<TicketDetail>(`/tickets/${id}/assign`, { assignedTo })
    return data
  },

  /** Renter tạo ticket mới */
  createMyTicket: async (payload: {
    roomId: number
    contractId?: number
    title: string
    description: string
    category: TicketCategory
    priority: TicketPriority
  }) => {
    const { data } = await apiClient.post<TicketDetail>('/tickets', payload)
    return data
  },

  /** Upload ảnh đính kèm */
  uploadAttachment: async (id: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post(`/tickets/${id}/attachments/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  /** Lấy danh sách ảnh đính kèm của ticket */
  getTicketAttachments: async (id: number) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketAttachment>>(`/tickets/${id}/attachments`)
    return data
  },

  /** Lấy danh sách ảnh đính kèm của my ticket */
  getMyTicketAttachments: async (id: number) => {
    const { data } = await apiClient.get<PaginatedResponse<TicketAttachment>>(`/tickets/me/${id}/attachments`)
    return data
  },
}

