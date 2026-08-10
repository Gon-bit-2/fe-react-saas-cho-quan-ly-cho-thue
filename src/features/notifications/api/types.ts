export type NotificationType =
  | 'INVOICE'
  | 'PAYMENT'
  | 'CONTRACT'
  | 'TICKET'
  | 'APPOINTMENT'
  | 'REVIEW'
  | 'REPORT'
  | 'MARKETPLACE'
  | 'RENTAL_REQUEST'
  | 'SYSTEM'

export interface Notification {
  id: number
  userId: number
  tenantId?: number | null
  title: string
  content: string
  type: NotificationType
  data: Record<string, unknown> // JSON data
  isRead: boolean
  readAt?: string | null
  createdAt: string
}
