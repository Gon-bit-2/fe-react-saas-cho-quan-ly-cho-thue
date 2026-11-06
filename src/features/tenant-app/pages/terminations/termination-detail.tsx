import { useParams, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Check,
  X,
  FileText,
  AlertCircle,
  Calendar,
  User,
  Home,
  MessageSquare,
  Calculator,
  ClipboardCheck,
  Receipt,
  FileCheck2,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { TERMINATION_STATUS_MAP } from '@/shared/constants/status-config'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LiquidationModal } from './components/liquidation-modal'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/shared/lib/utils'

/**
 * Trang chi tiết yêu cầu chấm dứt và thanh lý hợp đồng thuê
 * Hiển thị dự toán tài chính (hoàn cọc, trừ điện nước/hư hỏng) và tiến trình 4 giai đoạn thanh lý
 */
export default function Component() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLiquidationOpen, setIsLiquidationOpen] = useState(false)

  // Mock data dự phòng cho màn hình mô phỏng chi tiết
  const mockTermination = {
    id: id || '123',
    contractId: 'HD-2023-0192',
    roomId: '302',
    roomName: 'Phòng 302 - Tòa B',
    requester: 'Nguyễn Văn A',
    createdAt: '2023-11-20',
    expectedMoveOutDate: '2023-12-20',
    reason:
      'Chuyển công tác sang khu vực khác nên cần chuyển chỗ ở. Đã thông báo trước 30 ngày theo quy định hợp đồng.',
    deposit: 5000000,
    unpaidUtilities: 350000,
    estimatedDamage: 200000,
    status: 'PENDING',
  }

  /**
   * Xử lý phê duyệt hoặc từ chối yêu cầu thanh lý
   */
  const handleAction = (action: 'APPROVED' | 'REJECTED') => {
    toast.success(`Đã ${action === 'APPROVED' ? 'chấp thuận' : 'từ chối'} yêu cầu kết thúc hợp đồng`)
    setTimeout(() => {
      navigate('/yeu-cau-ket-thuc-hop-dong')
    }, 1000)
  }

  const totalRefund = mockTermination.deposit - mockTermination.unpaidUtilities - mockTermination.estimatedDamage

  return (
    <div className="animate-in fade-in mx-auto max-w-6xl space-y-6 pb-12 duration-500">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-slate-500 hover:text-slate-900"
        onClick={() => navigate('/yeu-cau-ket-thuc-hop-dong')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách yêu cầu
      </Button>

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Yêu cầu Kết thúc Hợp đồng</h1>
            <StatusBadge
              status={mockTermination.status}
              statusMap={TERMINATION_STATUS_MAP}
              fallbackLabel={mockTermination.status}
            />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Xem xét dự toán chi phí, hiện trạng phòng và tiến hành quyết toán thanh lý hợp đồng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => handleAction('REJECTED')}
          >
            <X className="mr-2 h-4 w-4" /> Từ chối
          </Button>
          <Button
            className="bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            onClick={() => handleAction('APPROVED')}
          >
            <Check className="mr-2 h-4 w-4" /> Chấp thuận
          </Button>
        </div>
      </div>

      <Alert className="border-blue-200 bg-blue-50 text-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="font-bold text-blue-900">Quy định thanh lý</AlertTitle>
        <AlertDescription className="mt-1 text-blue-700">
          Hợp đồng này yêu cầu thông báo trước 30 ngày. Khách thuê đã gửi yêu cầu đúng hạn. Hãy lên lịch kiểm tra phòng
          để tiến hành các bước kiểm kê tài sản và hoàn tất quyết toán cọc.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Request Details */}
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <FileText className="h-5 w-5 text-blue-600" /> Chi tiết Yêu cầu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      <FileText className="h-3 w-3" /> Mã hợp đồng
                    </div>
                    <div className="font-semibold text-blue-600 cursor-pointer hover:underline">
                      {mockTermination.contractId}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      <Home className="h-3 w-3" /> Phòng cho thuê
                    </div>
                    <div className="font-semibold text-slate-900">{mockTermination.roomName}</div>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      <User className="h-3 w-3" /> Người gửi yêu cầu
                    </div>
                    <div className="font-medium text-slate-900">{mockTermination.requester}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày yêu cầu</p>
                    <p className="mt-1 font-medium text-slate-900 tabular-nums">
                      {formatDate(mockTermination.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày dọn đi (Dự kiến)</p>
                    <p className="mt-1 font-semibold text-blue-600 tabular-nums">
                      {formatDate(mockTermination.expectedMoveOutDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="mb-2 flex items-center gap-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  <MessageSquare className="h-3 w-3" /> Lý do chấm dứt hợp đồng
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 italic">
                  "{mockTermination.reason}"
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Estimate */}
          <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <Calculator className="h-5 w-5 text-emerald-600" /> Dự toán Tài chính (Tạm tính)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between bg-white p-4 px-6">
                  <span className="font-medium text-slate-600">Tiền cọc đang giữ</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(mockTermination.deposit)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-red-50/30 p-4 px-6">
                  <span className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Phí điện nước phát sinh chưa trả
                  </span>
                  <span className="font-semibold text-red-600 tabular-nums">
                    -{formatCurrency(mockTermination.unpaidUtilities)}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-red-50/30 p-4 px-6">
                  <span className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Dự kiến khấu trừ hư hỏng (Tham khảo)
                  </span>
                  <span className="font-semibold text-red-600 tabular-nums">
                    -{formatCurrency(mockTermination.estimatedDamage)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t-2 border-slate-200 bg-slate-50 p-5 px-6">
                  <span className="font-bold text-slate-900">Tổng hoàn trả dự kiến</span>
                  <span className="text-xl font-bold text-blue-700 tabular-nums">{formatCurrency(totalRefund)}</span>
                </div>
              </div>
              <div className="border-t border-amber-100 bg-amber-50 p-4 text-center text-xs text-amber-800">
                Lưu ý: Đây chỉ là con số tạm tính. Cần thực hiện bước Kiểm tra phòng & tài sản để chốt số liệu cuối cùng.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="space-y-6">
          <Card className="sticky top-6 rounded-xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                <ClipboardCheck className="h-5 w-5 text-indigo-600" /> Tiến trình xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative space-y-8 pl-8 before:absolute before:inset-0 before:ml-3 before:h-[80%] before:w-[2px] before:-translate-x-px before:bg-slate-200">
                {/* Step 1: Active/Done */}
                <div className="relative">
                  <div className="absolute top-1 -left-[35px] z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Giai đoạn 1: Tiếp nhận yêu cầu</h4>
                    <p className="mt-1 text-xs text-slate-500">Khách thuê đã gửi yêu cầu. Cần xem xét và phản hồi.</p>
                  </div>
                </div>

                {/* Step 2: Current action */}
                <div className="relative">
                  <div className="absolute top-1 -left-[35px] z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-600 bg-white shadow-sm ring-4 ring-white">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-700">Giai đoạn 2: Kiểm tra phòng & tài sản</h4>
                    <p className="mt-1 mb-3 text-xs text-blue-600/80">
                      Lên lịch hẹn kiểm tra hiện trạng phòng và tài sản bàn giao.
                    </p>
                    <Button size="sm" className="w-full bg-blue-600 shadow-sm hover:bg-blue-700">
                      <Calendar className="mr-2 h-4 w-4" /> Lên lịch kiểm tra
                    </Button>
                  </div>
                </div>

                {/* Step 3: Actionable */}
                <div className="relative">
                  <div className="absolute top-1 -left-[35px] z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-indigo-600 bg-white shadow-sm ring-4 ring-white">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-700">Giai đoạn 3: Quyết toán chi phí</h4>
                    <p className="mt-1 mb-3 text-xs text-indigo-600/80">
                      Chốt các khoản phí phát sinh, tiền điện nước và hoàn cọc để đóng hợp đồng.
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-indigo-600 shadow-sm hover:bg-indigo-700"
                      onClick={() => setIsLiquidationOpen(true)}
                    >
                      <Receipt className="mr-2 h-4 w-4" /> Tiến hành Quyết toán
                    </Button>
                  </div>
                </div>

                {/* Step 4: Pending */}
                <div className="relative opacity-60">
                  <div className="absolute top-1 -left-[35px] z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-50 ring-4 ring-white">
                    <FileCheck2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Giai đoạn 4: Đóng hợp đồng</h4>
                    <p className="mt-1 text-xs text-slate-500">Ký biên bản thanh lý và chính thức kết thúc hợp đồng.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LiquidationModal
        isOpen={isLiquidationOpen}
        onClose={() => setIsLiquidationOpen(false)}
        onComplete={async () => {
          toast.success('Hợp đồng đã được đóng thành công!')
          navigate('/yeu-cau-ket-thuc-hop-dong')
        }}
        depositAmount={mockTermination.deposit}
        contractId={mockTermination.contractId}
        roomName={mockTermination.roomName}
      />
    </div>
  )
}
