import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { getPaymentDetail, approvePayment, rejectPayment } from '../api/index'
import { PaymentMethod, type Payment } from '../types/index'
import { ArrowLeft, XCircle, AlertTriangle, Receipt, ArrowRight, QrCode, ZoomIn, Check, X } from 'lucide-react'

/**
 * Màn hình đối soát thanh toán 3 chiều (Số tiền nộp - Hóa đơn công nợ - Ảnh minh chứng)
 * Cung cấp quy trình phê duyệt hoặc từ chối có lý do cụ thể
 */
export function PaymentReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      getPaymentDetail(id)
        .then((data) => {
          setPayment(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Failed to load payment detail for review', err)
          setIsLoading(false)
        })
    }
  }, [id])

  /**
   * Phê duyệt khoản thanh toán và chuyển về trang chi tiết
   */
  const handleApprove = async () => {
    if (!id) return
    setIsSubmitting(true)
    try {
      await approvePayment(id, {})
      setIsApproveOpen(false)
      navigate(`/thanh-toan/${id}`)
    } catch (error) {
      console.error('Failed to approve payment', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Từ chối khoản thanh toán kèm lý do cho người thuê
   */
  const handleReject = async () => {
    if (!id || !rejectReason.trim()) return
    setIsSubmitting(true)
    try {
      await rejectPayment(id, { landlordNote: rejectReason })
      setIsRejectOpen(false)
      navigate(`/thanh-toan/${id}`)
    } catch (error) {
      console.error('Failed to reject payment', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Lấy tên phương thức thanh toán
   */
  const getMethodName = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER:
        return 'Chuyển khoản VietQR'
      case PaymentMethod.CASH:
        return 'Tiền mặt'
      case PaymentMethod.WALLET:
        return 'Ví điện tử'
      default:
        return 'Khác'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Skeleton className="h-[450px] rounded-xl lg:col-span-8" />
          <Skeleton className="h-[450px] rounded-xl lg:col-span-4" />
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

  const remainingBalance = payment.invoice ? Math.max(0, payment.invoice.totalAmount - payment.amount) : 0

  return (
    <div className="space-y-6">
      {/* Header & Tiêu đề */}
      <div className="flex items-center gap-3">
        <Link to={`/thanh-toan/${id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            Đối Soát & Phê Duyệt{' '}
            <span className="font-mono text-xl text-slate-400">
              #{payment.transactionCode || `PAY-${payment.id.toString().padStart(6, '0')}`}
            </span>
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Đối chiếu số tiền nộp với số nợ trên hóa đơn{' '}
            <span className="font-semibold text-slate-700">{payment.invoice?.invoiceCode || 'N/A'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Khung đối soát 3 chiều & Minh chứng (Cột chính) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card so sánh đối soát 3 chiều */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="h-1.5 w-full bg-amber-500" />
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold tracking-wider text-amber-700 uppercase">
                    Chờ chủ trọ xác thực
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Ghi nhận lúc: {payment.paidAt ? formatDate(payment.paidAt) : 'Chưa có'}
                </span>
              </div>

              {/* 3 cột so sánh số liệu */}
              <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                {/* 1. Tiền người thuê chuyển */}
                <div className="space-y-1 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <span className="text-xs font-medium tracking-wider text-blue-700 uppercase">
                    Số tiền khách chuyển
                  </span>
                  <div className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="flex items-center gap-1 pt-1 text-xs text-blue-600">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{getMethodName(payment.method)}</span>
                  </div>
                </div>

                <div className="hidden justify-center text-slate-300 md:flex">
                  <ArrowRight className="h-6 w-6" />
                </div>

                {/* 2. Công nợ hóa đơn */}
                <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-xs font-medium tracking-wider text-slate-600 uppercase">Tổng tiền hóa đơn</span>
                  <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {formatCurrency(payment.invoice?.totalAmount || 0)}
                  </div>
                  <div className="flex items-center gap-1 pt-1 text-xs text-slate-500">
                    <Receipt className="h-3.5 w-3.5" />
                    <span className="font-mono">{payment.invoice?.invoiceCode || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Kết quả dự kiến sau khi duyệt */}
              <div className="flex flex-col gap-3 rounded-lg border-t border-slate-100 bg-slate-50/50 p-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs font-medium text-slate-500">Số nợ còn lại sau khi khớp khoản này</span>
                  <span className="text-xs text-slate-400">
                    {remainingBalance === 0
                      ? 'Hóa đơn sẽ được hoàn tất 100%'
                      : 'Hóa đơn sẽ chuyển sang trạng thái thanh toán một phần'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-xl font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Minh chứng chuyển khoản */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Receipt className="h-4 w-4 text-slate-500" />
                Minh Chứng Đính Kèm
              </CardTitle>
              {payment.evidenceUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <ZoomIn className="h-3.5 w-3.5" /> Phóng to
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex min-h-[320px] items-center justify-center bg-slate-50/50 p-4">
              {payment.evidenceUrl ? (
                <div
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative max-w-sm cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <img
                    src={payment.evidenceUrl}
                    alt="Chứng từ chuyển khoản"
                    className="h-auto max-h-[380px] w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                      <ZoomIn className="h-3.5 w-3.5" /> Xem chi tiết
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-8 text-center text-slate-400">
                  <Receipt className="mx-auto h-10 w-10 opacity-40" />
                  <p className="text-xs">Không có hình ảnh biên lai đính kèm.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột thao tác & cảnh báo (Cột phụ) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Box lưu ý */}
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1 text-xs">
              <span className="block font-semibold">Cần đối chiếu số tham chiếu</span>
              <p className="leading-relaxed text-amber-800">
                Vui lòng kiểm tra ứng dụng ngân hàng xem tiền đã thực sự về tài khoản chưa trước khi nhấn phê duyệt.
              </p>
            </div>
          </div>

          {/* Thẻ hành động */}
          <Card className="sticky top-20 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Quyết Định Phê Duyệt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Người nộp:</span>
                  <span className="font-semibold text-slate-900">{payment.payer?.fullName || 'Khách vãng lai'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Phòng:</span>
                  <span className="font-semibold text-slate-900">{payment.room?.title || 'Không rõ phòng'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Mã tham chiếu:</span>
                  <span className="max-w-[140px] truncate font-mono font-semibold text-slate-900">
                    {payment.transactionCode || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => setIsApproveOpen(true)}
                  className="h-10 w-full gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" /> Duyệt Thanh Toán
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  className="h-10 w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" /> Từ Chối Giao Dịch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog xác nhận duyệt */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận duyệt thanh toán?</DialogTitle>
            <DialogDescription>
              Khoản thanh toán trị giá{' '}
              <strong className="font-mono text-slate-900">{formatCurrency(payment.amount)}</strong> sẽ được khấu trừ
              trực tiếp vào hóa đơn{' '}
              <span className="font-mono font-semibold text-slate-900">{payment.invoice?.invoiceCode}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsApproveOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog từ chối */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5 text-red-600" />
              Từ chối khoản thanh toán
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để hệ thống gửi thông báo phản hồi cho người thuê phòng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason" className="text-xs font-semibold text-slate-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Chưa nhận được tiền vào tài khoản ngân hàng, ảnh biên lai mờ..."
              rows={4}
              className="text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
              className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal phóng to ảnh */}
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
