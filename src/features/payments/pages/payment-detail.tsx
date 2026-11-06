import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { PAYMENT_STATUS_MAP } from '@/shared/constants/status-config'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { getPaymentDetail, approvePayment } from '../api/index'
import { PaymentMethod, PaymentStatus } from '../types/index'
import {
  ArrowLeft,
  CheckCircle2,
  Receipt,
  CreditCard,
  QrCode,
  Banknote,
  Wallet,
  Building2,
  User,
  ExternalLink,
  ZoomIn,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  FileText,
} from 'lucide-react'

/**
 * Trang xem chi tiết một giao dịch thanh toán
 * Cho phép kiểm tra ảnh chứng từ, thông tin người nộp, đối chiếu hóa đơn liên quan và duyệt nhanh
 */
export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isApproving, setIsApproving] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  /**
   * Tải thông tin chi tiết thanh toán theo id qua TanStack Query (tránh cascading render từ useEffect)
   */
  const {
    data: payment,
    isLoading,
    refetch: loadDetail,
  } = useQuery({
    queryKey: ['payment-detail', id],
    queryFn: async () => {
      if (!id) return null
      return getPaymentDetail(id)
    },
    enabled: !!id,
  })

  /**
   * Phê duyệt nhanh khoản thanh toán
   */
  const handleApprove = async () => {
    if (!id) return
    setIsApproving(true)
    try {
      await approvePayment(id, {})
      await loadDetail()
    } catch (error) {
      console.error('Failed to approve payment', error)
    } finally {
      setIsApproving(false)
    }
  }

  /**
   * Sao chép mã giao dịch vào clipboard
   */
  const copyTransactionCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 1500)
  }

  /**
   * Lấy tên và icon phương thức thanh toán
   */
  const getMethodInfo = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER:
        return { name: 'Chuyển khoản VietQR', icon: QrCode }
      case PaymentMethod.CASH:
        return { name: 'Tiền mặt', icon: Banknote }
      case PaymentMethod.WALLET:
        return { name: 'Ví điện tử', icon: Wallet }
      default:
        return { name: 'Phương thức khác', icon: CreditCard }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-[400px] rounded-xl lg:col-span-5" />
          <Skeleton className="h-[400px] rounded-xl lg:col-span-7" />
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-slate-500">Không tìm thấy thông tin khoản thanh toán.</p>
        <Button variant="outline" onClick={() => navigate('/thanh-toan')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
        </Button>
      </div>
    )
  }

  const methodInfo = getMethodInfo(payment.method)
  const MethodIcon = methodInfo.icon
  const coveragePercent = payment.invoice
    ? Math.min(100, Math.round((payment.amount / payment.invoice.totalAmount) * 100))
    : 0

  return (
    <div className="space-y-6">
      {/* Header & Thanh điều hướng */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/thanh-toan">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900">
                {payment.transactionCode || `PAY-${payment.id.toString().padStart(6, '0')}`}
              </h1>
              <StatusBadge status={payment.status} configMap={PAYMENT_STATUS_MAP} />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Tạo lúc: {formatDate(payment.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {payment.status === PaymentStatus.PENDING && (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate(`/thanh-toan/${payment.id}/duyet`)}>
                Đối soát chi tiết
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isApproving}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isApproving ? 'Đang duyệt...' : 'Duyệt thanh toán'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid nội dung chính */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Chi tiết thanh toán & Hóa đơn liên quan */}
        <div className="space-y-6 lg:col-span-5">
          {/* Thẻ tiền thanh toán */}
          <Card className="relative overflow-hidden border-slate-200 shadow-sm">
            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-blue-50 blur-2xl" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                Tổng số tiền thanh toán
              </CardDescription>
              <CardTitle className="font-mono text-3xl font-extrabold text-blue-600 tabular-nums">
                {formatCurrency(payment.amount)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
                <div>
                  <span className="mb-1 block text-xs text-slate-400">Phương thức</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <MethodIcon className="h-4 w-4 text-blue-600" />
                    <span>{methodInfo.name}</span>
                  </div>
                </div>

                <div>
                  <span className="mb-1 block text-xs text-slate-400">Thời gian ghi nhận</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-slate-800">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{payment.paidAt ? formatDate(payment.paidAt) : 'Chưa có'}</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="mb-1 block text-xs text-slate-400">Mã tham chiếu ngân hàng</span>
                  <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2 font-mono text-xs text-slate-900">
                    <span className="truncate">{payment.transactionCode || 'Chưa cập nhật'}</span>
                    {payment.transactionCode && (
                      <button
                        type="button"
                        onClick={() => copyTransactionCode(payment.transactionCode!)}
                        className="ml-2 text-slate-400 hover:text-slate-700"
                        title="Sao chép"
                      >
                        {copiedCode ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thẻ đối chiếu Hóa đơn & Phòng */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Receipt className="h-4 w-4 text-slate-500" />
                Hóa Đơn Đối Ứng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.invoice ? (
                <>
                  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3.5">
                    <div className="space-y-1">
                      <Link
                        to={`/hoa-don/${payment.invoice.id}`}
                        className="flex items-center gap-1 font-mono text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {payment.invoice.invoiceCode}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{payment.room?.title || 'Phòng thuê'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs text-slate-400">Tổng tiền</span>
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        {formatCurrency(payment.invoice.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Tiến độ thanh toán */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Mức độ bù trừ công nợ</span>
                      <span className={coveragePercent >= 100 ? 'text-emerald-600' : 'text-amber-600'}>
                        {coveragePercent}%
                      </span>
                    </div>
                    <Progress value={coveragePercent} className="h-2" />
                    <div className="flex justify-between pt-1 text-[11px] text-slate-400">
                      <span>Đã nộp: {formatCurrency(payment.amount)}</span>
                      <span>
                        Còn thiếu: {formatCurrency(Math.max(0, payment.invoice.totalAmount - payment.amount))}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Không tìm thấy thông tin hóa đơn đính kèm.</p>
              )}

              {/* Thông tin người nộp */}
              <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-slate-400">Người thanh toán</span>
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {payment.payer?.fullName || 'Khách vãng lai'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Ảnh chứng từ & Ghi chú */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="flex h-full flex-col border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-900">Chứng Từ Chuyển Khoản</CardTitle>
              </div>
              {payment.evidenceUrl && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                    Phóng to
                  </Button>
                  <a href={payment.evidenceUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex min-h-[350px] flex-1 flex-col items-center justify-center bg-slate-50/50 p-4">
              {payment.evidenceUrl ? (
                <div
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative max-w-sm cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={payment.evidenceUrl}
                    alt="Chứng từ chuyển khoản"
                    className="h-auto max-h-[420px] w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md backdrop-blur-sm">
                      <ZoomIn className="h-3.5 w-3.5" /> Nhấp để xem ảnh lớn
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-8 text-center text-slate-400">
                  <Receipt className="mx-auto h-10 w-10 opacity-40" />
                  <p className="text-xs">Không có hình ảnh chứng từ đính kèm.</p>
                </div>
              )}
            </CardContent>

            {/* Ghi chú từ khách thuê */}
            <div className="flex items-start gap-3 border-t border-slate-100 bg-white p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <span className="mb-0.5 block font-semibold text-slate-700">Lời nhắn / Ghi chú từ người nộp</span>
                <p className="text-slate-500 italic">{payment.renterNote || 'Không có ghi chú nào đi kèm.'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal phóng to ảnh chứng từ */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl p-3">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Chi tiết chứng từ nộp tiền</DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex max-h-[80vh] items-center justify-center overflow-auto rounded-lg bg-slate-950/5 p-2">
            {payment.evidenceUrl && (
              <img
                src={payment.evidenceUrl}
                alt="Chứng từ chuyển khoản full"
                className="max-h-[75vh] w-auto rounded-md object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
