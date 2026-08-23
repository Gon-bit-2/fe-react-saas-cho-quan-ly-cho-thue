export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export type StatusVisual = {
  label: string
  tone: StatusTone
  icon?: string
  description?: string
}

export const getStatusVisual = (
  statusMap: Record<string, StatusVisual>,
  status: string,
  fallbackLabel: string = status
): StatusVisual => {
  return statusMap[status] || { label: fallbackLabel, tone: 'neutral' }
}

export const TICKET_STATUS_MAP: Record<string, StatusVisual> = {
  OPEN: { label: 'Mới tạo', tone: 'info' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: 'warning' },
  WAITING_RENTER: { label: 'Chờ phản hồi', tone: 'warning' },
  RESOLVED: { label: 'Đã giải quyết', tone: 'success' },
  CLOSED: { label: 'Đã đóng', tone: 'neutral' },
  CANCELED: { label: 'Đã hủy', tone: 'danger' },
}

export const TICKET_PRIORITY_MAP: Record<string, StatusVisual> = {
  URGENT: { label: 'Khẩn cấp', tone: 'danger' },
  HIGH: { label: 'Cao', tone: 'warning' },
  MEDIUM: { label: 'Trung bình', tone: 'info' },
  LOW: { label: 'Thấp', tone: 'neutral' },
}

export const METER_STATUS_MAP: Record<string, StatusVisual> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  BROKEN: { label: 'Báo hỏng', tone: 'danger' },
  INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
}

export const METER_READING_STATUS_MAP: Record<string, StatusVisual> = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  CONFIRMED: { label: 'Đã duyệt', tone: 'success' },
  ABNORMAL: { label: 'Bất thường', tone: 'danger' },
  REJECTED: { label: 'Đã từ chối', tone: 'danger' },
}

export const RENTAL_REQUEST_STATUS_MAP: Record<string, StatusVisual> = {
  PENDING: { label: 'Chờ duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  NEED_MORE_INFO: { label: 'Cần bổ sung', tone: 'warning' },
  CANCELED: { label: 'Đã hủy', tone: 'neutral' },
  CONVERTED_TO_CONTRACT: { label: 'Đã chuyển HĐ', tone: 'info' },
}

export const ROOM_STATUS_MAP: Record<string, StatusVisual> = {
  AVAILABLE: { label: 'Phòng trống', tone: 'success' },
  OCCUPIED: { label: 'Đang cho thuê', tone: 'info' },
  RESERVED: { label: 'Đã đặt cọc', tone: 'warning' },
  MAINTENANCE: { label: 'Đang bảo trì', tone: 'danger' },
  INACTIVE: { label: 'Ngừng hoạt động', tone: 'neutral' },
}

export const MARKETPLACE_STATUS_MAP: Record<string, StatusVisual> = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  PENDING_REVIEW: { label: 'Chờ duyệt', tone: 'warning' },
  PUBLISHED: { label: 'Đang đăng', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  HIDDEN: { label: 'Đã ẩn', tone: 'neutral' },
}

export const PROPERTY_STATUS_MAP: Record<string, StatusVisual> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  MAINTENANCE: { label: 'Bảo trì', tone: 'warning' },
  CLOSED: { label: 'Đóng cửa', tone: 'neutral' },
}

export const PROPERTY_TYPE_MAP: Record<string, StatusVisual> = {
  MINI_APARTMENT: { label: 'Chung cư mini', tone: 'neutral' },
  DORM: { label: 'Phòng trọ / KTX', tone: 'neutral' },
  HOUSE: { label: 'Nhà nguyên căn', tone: 'neutral' },
  APARTMENT: { label: 'Chung cư', tone: 'neutral' },
}

export const ASSET_CONDITION_MAP: Record<string, StatusVisual> = {
  NEW: { label: 'Mới', tone: 'info' },
  GOOD: { label: 'Tốt', tone: 'success' },
  NORMAL: { label: 'Bình thường', tone: 'neutral' },
  DAMAGED: { label: 'Hư hỏng', tone: 'danger' },
  LOST: { label: 'Mất', tone: 'danger' },
}

export const VERIFICATION_STATUS_MAP: Record<string, StatusVisual> = {
  VERIFIED: { label: 'Đã xác minh', tone: 'success' },
  PENDING: { label: 'Chờ xác minh', tone: 'warning' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  UNVERIFIED: { label: 'Chưa xác minh', tone: 'neutral' },
}

export const INVITE_STATUS_MAP: Record<string, StatusVisual> = {
  ACCEPTED: { label: 'Đã chấp nhận', tone: 'success' },
  PENDING: { label: 'Đang chờ', tone: 'warning' },
  EXPIRED: { label: 'Đã hết hạn', tone: 'neutral' },
  CANCELLED: { label: 'Đã hủy', tone: 'danger' },
}

export const TERMINATION_STATUS_MAP: Record<string, StatusVisual> = {
  PENDING: { label: 'Chờ duyệt', tone: 'warning' },
  APPROVED: { label: 'Đã duyệt', tone: 'success' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  COMPLETED: { label: 'Hoàn tất', tone: 'success' },
  CANCELED: { label: 'Đã hủy', tone: 'neutral' },
}

export const CONTRACT_STATUS_MAP: Record<string, StatusVisual> = {
  ACTIVE: { label: 'Đang hiệu lực', tone: 'success' },
  PENDING: { label: 'Chờ ký', tone: 'warning' },
  EXPIRED: { label: 'Đã hết hạn', tone: 'neutral' },
  TERMINATED: { label: 'Đã chấm dứt', tone: 'danger' },
}

export const SERVICE_STATUS_MAP: Record<string, StatusVisual> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  INACTIVE: { label: 'Ngừng HĐ', tone: 'neutral' },
}

export const HANDOVER_STATUS_MAP: Record<string, StatusVisual> = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'success' },
  DISPUTED: { label: 'Đang tranh chấp', tone: 'danger' },
}

export const APPOINTMENT_STATUS_MAP: Record<string, StatusVisual> = {
  PENDING: { label: 'Chờ xác nhận', tone: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', tone: 'info' },
  COMPLETED: { label: 'Hoàn tất', tone: 'success' },
  CANCELED: { label: 'Đã hủy', tone: 'danger' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  RESCHEDULED: { label: 'Đã dời lịch', tone: 'warning' },
}

export const INVOICE_STATUS_MAP: Record<string, StatusVisual> = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  UNPAID: { label: 'Chưa thanh toán', tone: 'warning' },
  PARTIALLY_PAID: { label: 'Thanh toán 1 phần', tone: 'info' },
  PAID: { label: 'Đã thanh toán', tone: 'success' },
  OVERDUE: { label: 'Quá hạn', tone: 'danger' },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral' },
}
