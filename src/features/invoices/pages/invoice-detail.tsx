import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { getInvoiceDetail, cancelInvoice, createPaymentQr } from '../api'
import { InvoiceStatus, InvoiceItemType, type Invoice, type InvoiceItem } from '../types'
import { INVOICE_STATUS_MAP } from '@/shared/constants/status-config'
import { toast } from 'sonner'
import { getPayments } from '../../payments/api'
import { type Payment } from '../../payments/types'
import { ManualPaymentDialog } from '../components/manual-payment-dialog'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import {
  ArrowLeft,
  Receipt,
  QrCode,
  Ban,
  BellRing,
  CreditCard,
  Home,
  Zap,
  Droplet,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  User,
  History,
  DoorOpen,
} from 'lucide-react'

/**
 * Trang Chi tiết Hóa đơn thu tiền phòng và tiện ích định kỳ.
 * Cung cấp bảng kê chi tiết từng hạng mục (Invoice Breakdown), mã VietQR và lịch sử các đợt thanh toán.
 */
export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      Promise.all([
        getInvoiceDetail(id),
        getPayments({ invoiceId: Number(id) }),
      ])
        .then(([invoiceData, paymentsData]) => {
          setInvoice(invoiceData)
          setPayments(paymentsData.data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setIsLoading(false)
        })
    }
  }, [id])

  const handleCancel = async () => {
    if (!invoice) return
    toast('Bạn có chắc chắn muốn hủy hóa đơn này?', {
      description: 'Hành động này sẽ đóng hóa đơn và dừng tính công nợ.',
      action: {
        label: 'Xác nhận hủy',
        onClick: async () => {
          setIsLoading(true)
          try {
            await cancelInvoice(invoice.id)
            toast.success('Đã hủy hóa đơn thành công')
            const data = await getInvoiceDetail(invoice.id)
            setInvoice(data)
          } catch (error) {
            console.error(error)
            toast.error('Có lỗi xảy ra khi hủy hóa đơn')
          } finally {
            setIsLoading(false)
          }
        },
      },
      cancel: {
        label: 'Đóng',
      },
    })
  }

  const handleRemind = () => {
    toast.success('Đã gửi thông báo nhắc nợ thành công tới người thuê!')
  }

  const handlePayOS = async () => {
    if (!invoice) return
    setIsLoading(true)
    try {
      const data = await createPaymentQr(invoice.id)
      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast.error('Không lấy được liên kết thanh toán VietQR')
      }
    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi tạo QR thanh toán')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <EmptyState
          icon={<Receipt className="h-8 w-8 text-rose-500" />}
          title="Không tìm thấy hóa đơn"
          description="Hóa đơn này có thể đã bị xóa hoặc bạn không có quyền truy cập."
          action={
            <Button variant="outline" asChild>
              <Link to="/hoa-don">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const getItemIcon = (type: InvoiceItemType) => {
    switch (type) {
      case InvoiceItemType.RENT:
        return <Home className="h-4 w-4 text-blue-600" />
      case InvoiceItemType.ELECTRICITY:
        return <Zap className="h-4 w-4 text-amber-500" />
      case InvoiceItemType.WATER:
        return <Droplet className="h-4 w-4 text-blue-500" />
      case InvoiceItemType.SERVICE:
        return <Wrench className="h-4 w-4 text-purple-600" />
      case InvoiceItemType.PENALTY:
        return <AlertTriangle className="h-4 w-4 text-rose-600" />
      default:
        return <Receipt className="h-4 w-4 text-slate-500" />
    }
  }

  const rentItemTypes: InvoiceItemType[] = [
    InvoiceItemType.RENT,
    InvoiceItemType.ELECTRICITY,
    InvoiceItemType.WATER,
    InvoiceItemType.SERVICE,
    InvoiceItemType.OTHER,
  ]
  const adjustmentItemTypes: InvoiceItemType[] = [InvoiceItemType.PENALTY, InvoiceItemType.DISCOUNT]
  const rentItems = invoice.items?.filter((item: InvoiceItem) => rentItemTypes.includes(item.itemType)) || []
  const adjustmentItems =
    invoice.items?.filter((item: InvoiceItem) => adjustmentItemTypes.includes(item.itemType)) || []

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs"
          >
            <Link to="/hoa-don">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/hoa-don" className="hover:text-blue-600">Hóa đơn</Link>
              <span>/</span>
              <span className="font-medium text-slate-900">Chi tiết</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {invoice.invoiceCode}
              </h1>
              <StatusBadge status={invoice.status} statusMap={INVOICE_STATUS_MAP} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleCancel}
            disabled={invoice.status === InvoiceStatus.CANCELED || invoice.status === InvoiceStatus.PAID}
          >
            <Ban className="h-3.5 w-3.5" /> Hủy hóa đơn
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={handleRemind}
            disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED}
          >
            <BellRing className="h-3.5 w-3.5" /> Nhắc nợ
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs text-blue-600 hover:bg-blue-50 border-blue-200"
            onClick={handlePayOS}
            disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED}
          >
            <QrCode className="h-3.5 w-3.5" /> Quét VietQR
          </Button>

          {invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELED && (
            <ManualPaymentDialog
              invoiceId={invoice.id}
              remainingAmount={invoice.debtAmount}
              trigger={
                <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs">
                  <CreditCard className="h-3.5 w-3.5" /> Thu tiền phòng
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Breakdown & Items */}
        <div className="space-y-6 lg:col-span-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Tổng tiền hóa đơn"
              value={formatCurrency(invoice.totalAmount)}
              description={`Kỳ ${new Date(invoice.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}`}
              icon={<Receipt className="h-5 w-5" />}
              tone="blue"
            />
            <MetricCard
              title="Đã thanh toán"
              value={formatCurrency(invoice.paidAmount)}
              description="Thực nhận từ người thuê"
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="emerald"
            />
            <MetricCard
              title="Công nợ còn lại"
              value={formatCurrency(invoice.debtAmount)}
              description={
                invoice.dueDate ? `Hạn nộp: ${formatDate(invoice.dueDate)}` : 'Chưa thiết lập hạn nộp'
              }
              icon={<AlertTriangle className="h-5 w-5" />}
              tone={invoice.debtAmount > 0 ? 'rose' : 'slate'}
            />
          </div>

          {/* Invoice Breakdown Table Card */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 p-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chi Tiết Bảng Kê Tiền Phòng & Dịch Vụ</h3>
                <p className="text-xs text-slate-500">Các hạng mục cước cấu thành nên tổng hóa đơn kỳ này</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Hạn nộp: {formatDate(invoice.dueDate)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100 text-xs uppercase font-semibold">
                    <th className="py-3 px-4">Hạng mục</th>
                    <th className="py-3 px-4 text-right">Số lượng / Chỉ số</th>
                    <th className="py-3 px-4 text-right">Đơn giá</th>
                    <th className="py-3 px-4 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {rentItems.map((item: InvoiceItem) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                            {getItemIcon(item.itemType)}
                          </div>
                          <span className="font-medium text-slate-900">{item.description}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-600 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-slate-600 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* Các khoản điều chỉnh (Phạt / Giảm trừ) */}
                  {adjustmentItems.map((item: InvoiceItem) => (
                    <tr key={item.id} className="bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-rose-700">{item.description}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-rose-600 tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 font-mono text-right text-rose-600 tabular-nums">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 px-4 font-mono text-right font-bold text-rose-700 tabular-nums">
                        {item.itemType === InvoiceItemType.DISCOUNT ? '-' : ''}
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Footer */}
            <div className="border-t border-slate-200 bg-slate-50/60 p-5 flex flex-col items-end gap-2">
              <div className="flex justify-between w-72 text-xs text-slate-600">
                <span>Tiền cước các mục:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              {invoice.penaltyAmount > 0 && (
                <div className="flex justify-between w-72 text-xs text-rose-600 font-medium">
                  <span>Phạt vi phạm / quá hạn:</span>
                  <span className="font-mono tabular-nums">+ {formatCurrency(invoice.penaltyAmount)}</span>
                </div>
              )}
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between w-72 text-xs text-emerald-600 font-medium">
                  <span>Chiết khấu / Giảm trừ:</span>
                  <span className="font-mono tabular-nums">- {formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="w-72 h-px bg-slate-200 my-1"></div>
              <div className="flex justify-between w-72 items-center">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="font-mono text-lg font-bold text-blue-600 tabular-nums">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tenant Info & Payment Log */}
        <div className="space-y-6 lg:col-span-4">
          {/* Tenant Information Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-500" />
              Khách thuê thanh toán
            </h3>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
                {invoice.renter?.fullName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{invoice.renter?.fullName}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <DoorOpen className="h-3 w-3 text-slate-400" />
                  <span>Phòng {invoice.room?.roomCode || invoice.room?.title}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{invoice.renter?.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{invoice.renter?.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Timeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <History className="h-4 w-4 text-slate-500" />
                Lịch sử thanh toán
              </h3>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                {payments.length} lượt
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">Chưa có giao dịch thanh toán nào</p>
                {invoice.debtAmount > 0 && (
                  <div className="mt-3">
                    <ManualPaymentDialog
                      invoiceId={invoice.id}
                      remainingAmount={invoice.debtAmount}
                      trigger={
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Ghi nhận đợt thanh toán
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                          {formatCurrency(payment.amount)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {payment.createdAt ? formatDate(payment.createdAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {payment.method === 'BANK_TRANSFER'
                          ? 'Chuyển khoản'
                          : payment.method === 'CASH'
                            ? 'Tiền mặt'
                            : payment.method}
                      </p>
                      {payment.transactionCode && (
                        <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">
                          Mã: {payment.transactionCode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
