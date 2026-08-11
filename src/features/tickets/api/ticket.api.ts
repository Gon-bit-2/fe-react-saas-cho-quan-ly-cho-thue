import { apiClient } from '@/shared/api/axios-client'
import type { TicketSummary, TicketDetail, TicketComment, TicketStatus, TicketCategory, TicketPriority } from './types'

export interface GetTicketsParams {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  roomId?: number
  contractId?: number
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
  getTickets: (params?: GetTicketsParams) =>
    apiClient.get<PaginatedResponse<TicketSummary>>('/tickets', { params }),

  /** Lấy chi tiết ticket */
  getTicketById: (id: number) =>
    apiClient.get<TicketDetail>(`/tickets/${id}`),

  /** Lấy danh sách bình luận của ticket */
  getTicketComments: (id: number) =>
    apiClient.get<TicketComment[]>(`/tickets/${id}/comments`),

  /** Lấy danh sách ticket của tôi (Renter) */
  getMyTickets: (params?: GetTicketsParams) =>
    apiClient.get<PaginatedResponse<TicketSummary>>('/tickets/me', { params }),

  /** Lấy chi tiết ticket của tôi */
  getMyTicketById: (id: number) =>
    apiClient.get<TicketDetail>(`/tickets/me/${id}`),

  /** Lấy bình luận ticket của tôi */
  getMyTicketComments: (id: number) =>
    apiClient.get<TicketComment[]>(`/tickets/me/${id}/comments`),

  /** Tạo bình luận mới */
  createComment: (id: number, content: string, isInternal: boolean = false) =>
    apiClient.post<TicketComment>(`/tickets/${id}/comments`, { content, isInternal }),

  /** Đổi trạng thái ticket */
  updateTicketStatus: (id: number, status: TicketStatus, note?: string) =>
    apiClient.patch<TicketDetail>(`/tickets/${id}/status`, { status, note }),

  /** Phân công người xử lý */
  assignTicket: (id: number, assignedTo: number | null) =>
    apiClient.patch<TicketDetail>(`/tickets/${id}/assign`, { assignedTo }),

  /** Renter tạo ticket mới */
  createMyTicket: (data: { roomId: number; contractId?: number; title: string; description: string; category: TicketCategory; priority: TicketPriority }) =>
    apiClient.post<TicketDetail>('/tickets/me', data),
}
