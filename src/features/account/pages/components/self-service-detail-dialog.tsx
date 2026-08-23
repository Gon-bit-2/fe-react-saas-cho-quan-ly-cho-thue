import { useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { apiClient } from '@/shared/api/axios-client'

import { format } from 'date-fns'

const HIDDEN_KEYS = new Set([
  'id', 'renterId', 'roomId', 'propertyId', 'tenantId', 
  'appointmentId', 'contractId', 'createdAt', 'updatedAt', 
  'userId', 'password', 'avatar', 'avatarUrl', 'signature',
  '_count', 'deletedAt', 'updatedById', 'createdById'
])

const KEY_LABELS: Record<string, string> = {
  scheduledAt: 'Ngày hẹn',
  status: 'Trạng thái',
  renter: 'Người thuê',
  room: 'Phòng',
  property: 'Khu trọ',
  title: 'Tiêu đề',
  basePrice: 'Giá phòng',
  depositAmount: 'Tiền cọc',
  name: 'Tên',
  fullName: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại',
  roomCode: 'Mã phòng',
  addressDetail: 'Địa chỉ chi tiết',
  ward: 'Phường/Xã',
  district: 'Quận/Huyện',
  province: 'Tỉnh/Thành phố',
  message: 'Lời nhắn',
  expectedStartDate: 'Ngày dự kiến chuyển vào',
  amount: 'Số tiền',
  totalAmount: 'Tổng tiền',
  description: 'Mô tả',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  depositRetained: 'Tiền cọc giữ lại',
  paymentMethod: 'Phương thức thanh toán',
  gender: 'Giới tính',
  dob: 'Ngày sinh',
  identityCard: 'CMND/CCCD',
  permanentAddress: 'Thường trú',
  area: 'Diện tích (m2)',
  maxRenters: 'Tối đa người',
  electricityPrice: 'Giá điện',
  waterPrice: 'Giá nước',
  internetPrice: 'Giá internet',
  cleaningPrice: 'Phí vệ sinh',
  note: 'Ghi chú',
  type: 'Loại',
  monthlyPrice: 'Giá thuê hàng tháng',
  billingCycle: 'Chu kỳ thanh toán',
  paymentDueDay: 'Ngày hạn thanh toán (hàng tháng)',
  contentSnapshot: 'Nội dung',
  marketplaceStatus: 'Trạng thái trên chợ',
  maxOccupants: 'Số người ở tối đa',
  landlord: 'Chủ trọ',
  ticket: 'Yêu cầu hỗ trợ',
  payment: 'Thanh toán',
  invoice: 'Hóa đơn',
  contract: 'Hợp đồng',
  content: 'Nội dung',
  invoiceCode: 'Mã hóa đơn',
  billingMonth: 'Tháng thanh toán',
  issueDate: 'Ngày xuất',
  dueDate: 'Hạn chót',
  subtotal: 'Tạm tính',
  discountAmount: 'Số tiền giảm',
  penaltyAmount: 'Phí phạt trễ hạn',
  paidAmount: 'Đã thanh toán',
  debtAmount: 'Còn nợ',
  items: 'Các khoản thu',
  debt: 'Khoản nợ',
  quantity: 'Số lượng',
  unitPrice: 'Đơn giá',
  originalAmount: 'Số tiền ban đầu',
  remainingAmount: 'Số tiền còn lại',
  resolvedAt: 'Ngày giải quyết',
  itemType: 'Loại hạng mục',
  contractCode: 'Mã hợp đồng',
  payments: 'Lịch sử thanh toán',
  paymentCode: 'Mã thanh toán',
  referenceCode: 'Mã tham chiếu',
}

function renderObject(obj: Record<string, unknown>, level = 0) {
  return (
    <div className={`flex w-full flex-col gap-3 ${level > 0 ? 'mt-2 rounded-lg bg-muted/30 p-4' : ''}`}>
      {Object.entries(obj).map(([k, v]) => {
        if (v === null || v === undefined || v === '') return null
        if (HIDDEN_KEYS.has(k)) return null
        
        const label = KEY_LABELS[k] || k
        const isObject = typeof v === 'object'
        
        let displayValue: React.ReactNode
        
        if (Array.isArray(v)) {
          if (v.length === 0) {
            displayValue = <span className="text-muted-foreground italic text-xs">Trống</span>
          } else {
            displayValue = (
              <div className="flex flex-col gap-3 border-l-2 border-muted pl-4">
                {v.map((item, idx) => (
                  <div key={idx}>
                    {typeof item === 'object' && item !== null
                      ? renderObject(item as Record<string, unknown>, level + 1)
                      : String(item)}
                  </div>
                ))}
              </div>
            )
          }
        } else if (isObject) {
          displayValue = renderObject(v as Record<string, unknown>, level + 1)
        } else if (typeof v === 'boolean') {
          displayValue = v ? 'Có' : 'Không'
        } else {
          // Check for currency
          const isCurrency = 
            k.toLowerCase().includes('price') || 
            k.toLowerCase().includes('amount') || 
            k.toLowerCase().includes('fee') || 
            k.toLowerCase() === 'subtotal' ||
            k === 'depositRetained'
            
          if (isCurrency && !isNaN(Number(v))) {
            displayValue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(v))
          }
          // Check for ISO date string
          else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
            displayValue = format(new Date(v), 'dd/MM/yyyy HH:mm')
          } 
          // Enums translations mapping if applicable
          else if (typeof v === 'string') {
            const enumsMap: Record<string, string> = {
              PENDING: 'Đang chờ',
              CONFIRMED: 'Đã xác nhận',
              REJECTED: 'Từ chối',
              CANCELED: 'Đã hủy',
              COMPLETED: 'Hoàn thành',
              RESCHEDULED: 'Đổi lịch',
              NEED_MORE_INFO: 'Cần bổ sung',
              APPROVED: 'Đã duyệt',
              ACTIVE: 'Đang hoạt động',
              EXPIRED: 'Hết hạn',
              PAID: 'Đã thanh toán',
              UNPAID: 'Chưa thanh toán',
              OVERDUE: 'Quá hạn',
              PARTIAL: 'Thanh toán một phần',
              IN_PROGRESS: 'Đang xử lý',
              OPEN: 'Đang mở',
              RESOLVED: 'Đã giải quyết',
              CLOSED: 'Đã đóng',
              MONTHLY: 'Hàng tháng',
              YEARLY: 'Hàng năm',
              WEEKLY: 'Hàng tuần',
              OCCUPIED: 'Đã cho thuê',
              AVAILABLE: 'Trống',
              MAINTENANCE: 'Bảo trì',
              HIDDEN: 'Đã ẩn',
              VISIBLE: 'Đang hiển thị',
              ROOM: 'Phòng',
              PROPERTY: 'Khu trọ',
              GENERAL: 'Chung',
              RENT: 'Tiền thuê phòng',
              ELECTRICITY: 'Tiền điện',
              WATER: 'Tiền nước',
              SERVICE: 'Tiền dịch vụ',
              PARKING: 'Tiền gửi xe',
              INTERNET: 'Tiền mạng',
              PENALTY: 'Phạt trễ hạn',
              DISCOUNT: 'Giảm giá',
              OTHER: 'Khác',
            }
            displayValue = enumsMap[v] || v
          } else {
            displayValue = String(v)
          }
        }

        return (
          <div
            key={k}
            className={`flex border-b border-border/50 pb-3 last:border-0 last:pb-0 ${
              isObject ? 'flex-col gap-2 items-start' : 'items-center justify-between gap-4'
            }`}
          >
            <span className="text-sm font-medium text-muted-foreground capitalize">{label}</span>
            <div className={isObject ? 'w-full' : 'text-right font-medium'}>
              {displayValue}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SelfServiceDetailDialog({
  open,
  onOpenChange,
  endpoint,
  id,
  title,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint: string
  id: number | null
  title: string
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['self-service-detail', endpoint, id],
    queryFn: () => apiClient.get(`${endpoint}/${id}`).then((r) => r.data),
    enabled: !!id && open,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isLoading && <div className="p-4 text-center text-muted-foreground">Đang tải...</div>}
        {isError && <div className="p-4 text-center text-destructive">Lỗi khi tải chi tiết.</div>}

        {data && (
          <div className="text-sm mt-4">
            {renderObject(data)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
