import { apiClient } from '@/shared/api/axios-client'
import type { Notification } from './types'

export interface GetNotificationsParams {
  page?: number
  limit?: number
  isRead?: boolean
  type?: string
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

export const notificationApi = {
  /** Lấy danh sách thông báo */
  getNotifications: (params?: GetNotificationsParams) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),

  /** Đánh dấu thông báo đã đọc */
  markAsRead: (id: number) =>
    apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`),

  /** Đánh dấu tất cả đã đọc */
  markAllAsRead: () =>
    apiClient.post<{ success: boolean }>('/notifications/read-all'),

  /** Lấy số lượng thông báo chưa đọc */
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),
}
