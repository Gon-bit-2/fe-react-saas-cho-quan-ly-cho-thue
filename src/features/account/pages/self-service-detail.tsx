import { useQuery } from '@tanstack/react-query'
import { useParams, useLocation, useNavigate } from 'react-router'
import { apiClient } from '@/shared/api/axios-client'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { format } from 'date-fns'

const HIDDEN_KEYS = new Set([
  'id', 'renterId', 'roomId', 'propertyId', 'tenantId', 
  'appointmentId', 'contractId', 'createdAt', 'updatedAt', 
  'userId', 'password', 'avatar', 'avatarUrl', 'signature',
  '_count', 'deletedAt', 'updatedById', 'createdById', 'assignedTo'
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

  // Các trường tiếng Anh (pascal và camel) cần việt hóa cho Invoice và Ticket:
  invoiceId: 'Mã hóa đơn',
  InvoiceId: 'Mã hóa đơn',
  payerId: 'Người thanh toán',
  PayerId: 'Người thanh toán',
  method: 'Phương thức',
  Method: 'Phương thức',
  provider: 'Nhà cung cấp',
  Provider: 'Nhà cung cấp',
  transactionCode: 'Mã giao dịch',
  TransactionCode: 'Mã giao dịch',
  submittedAt: 'Ngày gửi',
  SubmittedAt: 'Ngày gửi',
  renterNote: 'Ghi chú của người thuê',
  RenterNote: 'Ghi chú của người thuê',
  rejectedById: 'Người từ chối',
  RejectedById: 'Người từ chối',
  rejectedAt: 'Ngày từ chối',
  RejectedAt: 'Ngày từ chối',
  landlordNote: 'Ghi chú của chủ nhà',
  LandlordNote: 'Ghi chú của chủ nhà',
  assignedTo: 'Người phụ trách',
  AssignedTo: 'Người phụ trách',
  category: 'Danh mục',
  Category: 'Danh mục',
  priority: 'Mức độ',
  Priority: 'Mức độ',
  TrạngThái: 'Trạng thái',
  MãHóaĐơn: 'Mã hóa đơn',
  MãPhòng: 'Mã phòng',
  'Mã Phòng': 'Mã phòng',
  NgayHen: 'Ngày hẹn',
  'Ngày Hẹn': 'Ngày hẹn',
  NgườiThuê: 'Người thuê',
  'Người Thuê': 'Người thuê',
  GhiChú: 'Ghi chú',
  'Ghi Chú': 'Ghi chú',
  KhuTrọ: 'Khu trọ',
  'Khu Trọ': 'Khu trọ',
  TiềnCọc: 'Tiền cọc',
  'Tiền Cọc': 'Tiền cọc',
  GiáPhòng: 'Giá phòng',
  'Giá Phòng': 'Giá phòng',
  TiêuĐề: 'Tiêu đề',
  'Tiêu Đề': 'Tiêu đề',
  TrangThái: 'Trạng thái',
  'Trang Thái': 'Trạng thái',
  'Trạng Thái': 'Trạng thái',
  'Ho Và Tên': 'Họ và tên',
  HoVàTên: 'Họ và tên'
}

function renderObject(obj: Record<string, unknown>, level = 0) {
  return (
    <div className={`flex w-full flex-col gap-4 ${level > 0 ? 'mt-2 rounded-lg bg-slate-50/50 p-5 border border-slate-100' : ''}`}>
      {Object.entries(obj).map(([k, v]) => {
        if (v === null || v === undefined || v === '') return null
        if (HIDDEN_KEYS.has(k)) return null
        
        const label = KEY_LABELS[k] || k
        const isObject = typeof v === 'object'
        
        let displayValue: React.ReactNode
        
        if (Array.isArray(v)) {
          if (v.length === 0) {
            displayValue = <span className="text-slate-400 italic text-sm">Trống</span>
          } else {
            displayValue = (
              <div className="flex flex-col gap-3 border-l-2 border-slate-200 pl-4 mt-2">
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
            k === 'depositRetained' ||
            k === 'Số Tiền' || k === 'TiềnCọc' || k === 'GiáPhòng' ||
            k === 'Tiền Cọc' || k === 'Giá Phòng'
            
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
              ELECTRICITY: k === 'category' || k === 'Category' ? 'Điện' : 'Tiền điện',
              WATER: k === 'category' || k === 'Category' ? 'Nước' : 'Tiền nước',
              SERVICE: 'Tiền dịch vụ',
              PARKING: 'Tiền gửi xe',
              INTERNET: k === 'category' || k === 'Category' ? 'Internet' : 'Tiền mạng',
              FURNITURE: 'Nội thất',
              SECURITY: 'An ninh',
              CLEANING: 'Vệ sinh',
              PENALTY: 'Phạt trễ hạn',
              DISCOUNT: 'Giảm giá',
              OTHER: 'Khác',
              BANK_TRANSFER: 'Chuyển khoản ngân hàng',
              MANUAL_CONFIRMATION: 'Xác nhận thủ công',
              FAILED: 'Thất bại',
              HIGH: 'Cao',
              MEDIUM: 'Trung bình',
              LOW: 'Thấp'
            }
            displayValue = enumsMap[v] || v
          } else {
            displayValue = String(v)
          }
        }

        return (
          <div
            key={k}
            className={`flex border-b border-slate-100 pb-4 last:border-0 last:pb-0 ${
              isObject ? 'flex-col gap-2 items-start' : 'items-center justify-between gap-4'
            }`}
          >
            <span className="text-sm font-semibold text-slate-500 capitalize">{label}</span>
            <div className={isObject ? 'w-full' : 'text-right font-medium text-slate-900'}>
              {displayValue}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const SECTIONS = {
  'thanh-toan': {
    title: 'Chi tiết thanh toán',
    endpoint: '/payments/me',
  },
  'ho-tro': {
    title: 'Chi tiết yêu cầu hỗ trợ',
    endpoint: '/tickets/me',
  },
  'lich-xem-phong': {
    title: 'Chi tiết lịch xem phòng',
    endpoint: '/room-viewing-appointments/me',
  },
} as const

export default function SelfServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  
  const pathParts = location.pathname.split('/').filter(Boolean)
  // path is like /tai-khoan/thanh-toan/:id
  const slug = (pathParts[pathParts.length - 2] as keyof typeof SECTIONS) || 'thanh-toan'
  const section = SECTIONS[slug] ?? SECTIONS['thanh-toan']

  const { data, isLoading, isError } = useQuery({
    queryKey: ['self-service-detail', section.endpoint, id],
    queryFn: () => apiClient.get(`${section.endpoint}/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full w-10 h-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm text-slate-500">Khu vực tự phục vụ</p>
          <h1 className="text-2xl font-bold text-slate-900">{section.title}</h1>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {isLoading && <div className="p-8 text-center text-slate-500">Đang tải chi tiết...</div>}
        
        {isError && (
          <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
            Không thể tải dữ liệu. Vui lòng thử lại sau.
          </div>
        )}

        {data && (
          <div className="text-base">
            {renderObject(data)}
          </div>
        )}
      </div>
    </div>
  )
}
