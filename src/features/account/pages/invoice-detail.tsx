import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, Receipt, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/axios-client'
import { InvoiceStatus, InvoiceItemType, type Invoice, type InvoiceItem } from '@/features/invoices/types'
import { toast } from 'sonner'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showQrDialog, setShowQrDialog] = useState(false)

  const { data: invoice, isLoading, isError } = useQuery<Invoice>({
    queryKey: ['my-invoice-detail', id],
    queryFn: () => apiClient.get(`/invoices/me/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const { mutate: generateQr, isPending: isGeneratingQr, data: qrData } = useMutation({
    mutationFn: () => apiClient.post(`/invoices/me/${id}/payment-qr`, {}).then((r) => r.data),
    onSuccess: (data) => {
      if (data && data.checkoutUrl) {
        // Redirect to PayOS checkout if available
        window.location.href = data.checkoutUrl
      } else if (data && data.qrCode) {
        // Fallback to displaying QR if returned string
        setShowQrDialog(true)
      } else {
        toast.error('Không lấy được link thanh toán.')
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi tạo mã QR thanh toán.')
    }
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hoa-don')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-blue-600" />
              Chi tiết hóa đơn
            </h1>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-12 text-center text-slate-500">
          Đang tải dữ liệu...
        </div>
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hoa-don')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
          <AlertCircle className="mx-auto h-8 w-8 mb-3 opacity-50" />
          <p>Không thể tải thông tin hóa đơn. Hóa đơn có thể không tồn tại hoặc bạn không có quyền truy cập.</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đã thanh toán</Badge>
      case InvoiceStatus.OVERDUE:
        return <Badge className="bg-red-100 text-red-800 border-none px-3 py-1"><AlertCircle className="w-3.5 h-3.5 mr-1" /> Quá hạn</Badge>
      case InvoiceStatus.DRAFT:
        return <Badge className="bg-slate-100 text-slate-800 border-none px-3 py-1">Bản nháp</Badge>
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1">Chưa thanh toán</Badge>
    }
  }

  const rentItemTypes = [InvoiceItemType.RENT, InvoiceItemType.ELECTRICITY, InvoiceItemType.WATER, InvoiceItemType.SERVICE, InvoiceItemType.OTHER]
  const adjustmentItemTypes = [InvoiceItemType.PENALTY, InvoiceItemType.DISCOUNT]
  const rentItems = invoice.items?.filter((item: InvoiceItem) => rentItemTypes.includes(item.itemType)) || []
  const adjustmentItems = invoice.items?.filter((item: InvoiceItem) => adjustmentItemTypes.includes(item.itemType)) || []

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tai-khoan/hoa-don')} className="shrink-0 bg-slate-100 hover:bg-slate-200">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {invoice.invoiceCode || `Hóa đơn #${invoice.id}`}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Kỳ thanh toán: {new Date(invoice.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(invoice.status === InvoiceStatus.UNPAID || invoice.status === InvoiceStatus.OVERDUE || invoice.status === InvoiceStatus.PARTIAL) && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
              onClick={() => generateQr()}
              disabled={isGeneratingQr}
            >
              <QrCode className="mr-2 h-4 w-4" />
              {isGeneratingQr ? 'Đang xử lý...' : 'Thanh toán trực tuyến'}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500 mb-1">Tổng phải trả</p>
          <p className="text-3xl font-bold text-slate-900">{invoice.totalAmount.toLocaleString('vi-VN')} ₫</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-emerald-700 mb-1">Đã thanh toán</p>
          <p className="text-3xl font-bold text-emerald-600">{invoice.paidAmount.toLocaleString('vi-VN')} ₫</p>
        </div>
        <div className="bg-red-50 rounded-xl p-5 shadow-sm border border-red-100 flex flex-col justify-center">
          <p className="text-sm font-medium text-red-700 mb-1">Còn nợ</p>
          <p className="text-3xl font-bold text-red-600">{invoice.debtAmount.toLocaleString('vi-VN')} ₫</p>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Chi tiết các khoản thu</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white text-slate-500 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider w-1/2">Mô tả</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Số lượng</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Đơn giá</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-900 divide-y divide-slate-100">
              {rentItems.map((item: InvoiceItem) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-medium text-slate-800">{item.description}</td>
                  <td className="py-4 px-6 text-right text-slate-500">{item.quantity}</td>
                  <td className="py-4 px-6 text-right text-slate-500">{item.unitPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-4 px-6 text-right font-semibold">{item.amount.toLocaleString('vi-VN')} ₫</td>
                </tr>
              ))}
              
              {adjustmentItems.map((item: InvoiceItem) => (
                <tr key={item.id} className="bg-orange-50/30 hover:bg-orange-50/60 transition-colors">
                  <td className="py-4 px-6 font-medium text-orange-700 flex items-center gap-2">
                    {item.itemType === InvoiceItemType.PENALTY && <AlertCircle className="w-4 h-4" />}
                    {item.description}
                  </td>
                  <td className="py-4 px-6 text-right text-orange-600/70">{item.quantity}</td>
                  <td className="py-4 px-6 text-right text-orange-600/70">{item.unitPrice.toLocaleString('vi-VN')}</td>
                  <td className="py-4 px-6 text-right font-semibold text-orange-700">
                    {item.itemType === InvoiceItemType.DISCOUNT ? '-' : ''}{item.amount.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals Footer */}
        <div className="bg-slate-50 p-6 flex flex-col items-end gap-3 border-t border-slate-200">
          <div className="flex justify-between w-72 text-sm text-slate-600">
            <span>Tạm tính</span>
            <span className="font-medium">{invoice.subtotal.toLocaleString('vi-VN')} ₫</span>
          </div>
          {invoice.penaltyAmount > 0 && (
            <div className="flex justify-between w-72 text-sm text-orange-600">
              <span>Phạt quá hạn</span>
              <span className="font-medium">+ {invoice.penaltyAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between w-72 text-sm text-emerald-600">
              <span>Giảm giá</span>
              <span className="font-medium">- {invoice.discountAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          <div className="w-72 h-px bg-slate-200 my-2"></div>
          <div className="flex justify-between w-72 items-center">
            <span className="text-lg font-semibold text-slate-900">Tổng phải trả</span>
            <span className="text-xl font-bold text-blue-600">{invoice.totalAmount.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>
      </div>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-slate-900">Quét mã QR để thanh toán</DialogTitle>
            <DialogDescription className="text-center text-slate-500">
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã này.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="p-4 bg-white rounded-xl border-2 border-blue-100 shadow-sm mb-6">
              {qrData?.qrCode ? (
                <img 
                  src={`https://quickchart.io/qr?text=${encodeURIComponent(qrData.qrCode)}&size=240`} 
                  alt="Payment QR" 
                  className="w-[240px] h-[240px]" 
                />
              ) : (
                <div className="w-[240px] h-[240px] bg-slate-100 flex items-center justify-center text-slate-400">
                  QR Code Placeholder
                </div>
              )}
            </div>
            <div className="text-center space-y-2 w-full px-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-slate-900">{invoice.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nội dung:</span>
                <span className="font-medium text-slate-900">{qrData?.transferContent || invoice.invoiceCode}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
