import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getInvoiceDetail, cancelInvoice, createPaymentQr } from '../api';
import { InvoiceStatus, InvoiceItemType, type Invoice, type InvoiceItem } from '../types';
import { toast } from 'sonner';
import { getPayments } from '../../payments/api';
import { type Payment } from '../../payments/types';
import { ManualPaymentDialog } from '../components/manual-payment-dialog';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        getInvoiceDetail(id),
        getPayments({ invoiceId: Number(id) })
      ]).then(([invoiceData, paymentsData]) => {
        setInvoice(invoiceData);
        setPayments(paymentsData.data);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [id]);

  const handleCancel = async () => {
    if (!invoice) return;
    if (window.confirm('Bạn có chắc chắn muốn hủy hóa đơn này?')) {
      setIsLoading(true);
      try {
        await cancelInvoice(invoice.id);
        toast.success('Đã hủy hóa đơn thành công');
        const data = await getInvoiceDetail(invoice.id);
        setInvoice(data);
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi xảy ra khi hủy hóa đơn');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemind = () => {
    toast.success('Đã gửi thông báo nhắc nhở người thuê thành công!');
  };

  const handleRecordPayment = () => {
    toast.info('Tính năng ghi nhận thanh toán thủ công đang được phát triển.');
  };

  const handlePayOS = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      const data = await createPaymentQr(invoice.id);
      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Không lấy được link thanh toán PayOS');
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tạo QR thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">Đang tải...</div>;
  }

  if (!invoice) {
    return <div className="p-8">Không tìm thấy hóa đơn</div>;
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đã thanh toán</Badge>;
      case InvoiceStatus.OVERDUE:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Quá hạn</Badge>;
      case InvoiceStatus.DRAFT:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Bản nháp</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Chưa thanh toán</Badge>;
    }
  };

  const getItemIcon = (type: InvoiceItemType) => {
    switch (type) {
      case InvoiceItemType.RENT: return 'bed';
      case InvoiceItemType.ELECTRICITY: return 'bolt';
      case InvoiceItemType.WATER: return 'water_drop';
      case InvoiceItemType.SERVICE: return 'cleaning_services';
      case InvoiceItemType.PENALTY: return 'warning';
      default: return 'receipt_long';
    }
  };

  const getItemColor = (type: InvoiceItemType) => {
    switch (type) {
      case InvoiceItemType.RENT: return 'bg-blue-100 text-blue-700';
      case InvoiceItemType.ELECTRICITY: return 'bg-orange-100 text-orange-600';
      case InvoiceItemType.WATER: return 'bg-cyan-100 text-cyan-600';
      case InvoiceItemType.SERVICE: return 'bg-indigo-100 text-indigo-700';
      case InvoiceItemType.PENALTY: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const rentItemTypes: InvoiceItemType[] = [
    InvoiceItemType.RENT,
    InvoiceItemType.ELECTRICITY,
    InvoiceItemType.WATER,
    InvoiceItemType.SERVICE,
    InvoiceItemType.OTHER,
  ];
  const adjustmentItemTypes: InvoiceItemType[] = [InvoiceItemType.PENALTY, InvoiceItemType.DISCOUNT];
  const rentItems = invoice.items?.filter((item: InvoiceItem) => rentItemTypes.includes(item.itemType)) || [];
  const adjustmentItems =
    invoice.items?.filter((item: InvoiceItem) => adjustmentItemTypes.includes(item.itemType)) || [];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-full pb-20">
      {/* Action Bar */}
      <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link to="/hoa-don">
            <Button variant="ghost" size="icon" className="rounded-full">
              <span className="material-symbols-outlined">arrow_back</span>
            </Button>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceCode}</h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Tạo ngày {new Date(invoice.createdAt).toLocaleDateString('vi-VN')} • Hạn thanh toán {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleCancel} disabled={invoice.status === InvoiceStatus.CANCELED || invoice.status === InvoiceStatus.PAID}>
            <span className="material-symbols-outlined text-[18px]">cancel</span> Hủy
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRemind}>
            <span className="material-symbols-outlined text-[18px]">notifications_active</span> Nhắc nhở
          </Button>
          <Button variant="default" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={handlePayOS} disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED}>
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span> Thanh toán QR
          </Button>
          
          {(invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED) ? (
            <Button className="flex items-center gap-2" disabled>
              <span className="material-symbols-outlined text-[18px]">payments</span> Ghi nhận
            </Button>
          ) : (
            <ManualPaymentDialog 
              invoiceId={invoice.id} 
              remainingAmount={invoice.debtAmount}
              trigger={
                <Button className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">payments</span> Ghi nhận
                </Button>
              }
            />
          )}
        </div>
      </div>

      <div className="px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Line Items */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Tổng Tiền</p>
                <p className="text-3xl font-bold text-slate-900">{invoice.totalAmount.toLocaleString()} ₫</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 mb-1">Đã Thanh Toán</p>
                <p className="text-3xl font-bold text-emerald-600">{invoice.paidAmount.toLocaleString()} ₫</p>
              </div>
              <div className="bg-red-50/50 rounded-xl p-5 shadow-sm border border-red-100">
                <p className="text-sm font-medium text-red-600 mb-1">Còn Nợ</p>
                <p className="text-3xl font-bold text-red-600">{invoice.debtAmount.toLocaleString()} ₫</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span> Chi Tiết Hóa Đơn
                </h2>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Kỳ: {new Date(invoice.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b-2 border-slate-200">
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider w-1/2">Mô tả</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">SL/Chỉ số</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Đơn giá</th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-900">
                    {rentItems.map((item: InvoiceItem) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${getItemColor(item.itemType)}`}>
                              <span className="material-symbols-outlined text-[18px]">{getItemIcon(item.itemType)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500">{item.quantity}</td>
                        <td className="py-4 px-6 text-right text-slate-500">{item.unitPrice.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-medium">{item.amount.toLocaleString()} ₫</td>
                      </tr>
                    ))}
                    
                    {adjustmentItems.map((item: InvoiceItem) => (
                      <tr key={item.id} className="bg-red-50/30 hover:bg-red-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">warning</span>
                            </div>
                            <div>
                              <p className="font-medium text-red-600">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-red-500/70">{item.quantity}</td>
                        <td className="py-4 px-6 text-right text-red-500/70">{item.unitPrice.toLocaleString()}</td>
                        <td className="py-4 px-6 text-right font-medium text-red-600">
                          {item.itemType === InvoiceItemType.DISCOUNT ? '-' : ''}{item.amount.toLocaleString()} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals Footer */}
              <div className="bg-slate-50 p-6 flex flex-col items-end gap-3 border-t border-slate-200">
                <div className="flex justify-between w-64 text-sm text-slate-500">
                  <span>Tổng tiền phí</span>
                  <span>{invoice.subtotal.toLocaleString()} ₫</span>
                </div>
                {invoice.penaltyAmount > 0 && (
                  <div className="flex justify-between w-64 text-sm text-red-600">
                    <span>Phạt quá hạn</span>
                    <span>+ {invoice.penaltyAmount.toLocaleString()} ₫</span>
                  </div>
                )}
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between w-64 text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>- {invoice.discountAmount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="w-64 h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between w-64 items-center">
                  <span className="text-lg font-semibold text-slate-900">Tổng Cộng</span>
                  <span className="text-lg font-bold text-slate-900">{invoice.totalAmount.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Meta & Payments */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Tenant Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-6 relative z-10">Người Thuê</h3>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl text-slate-500">
                  {invoice.renter?.fullName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{invoice.renter?.fullName}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{invoice.room?.title}</p>
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">mail</span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{invoice.renter?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">phone</span>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Số điện thoại</p>
                    <p className="text-sm font-medium text-slate-900">{invoice.renter?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Lịch Sử Thanh Toán</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">{payments.length} Giao dịch</span>
              </div>
              
              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                    <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">Chưa có khoản thanh toán</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Các khoản thanh toán cho hóa đơn này sẽ hiển thị ở đây.</p>
                  <Button variant="outline" className="mt-4" onClick={handleRecordPayment} disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED}>
                    Thêm Ghi Nhận
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map(payment => (
                    <div key={payment.id} className="flex items-start gap-4 p-4 border border-slate-100 rounded-lg bg-slate-50">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900">{payment.amount.toLocaleString()} ₫</p>
                          <span className="text-xs font-medium text-slate-500">{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Phương thức: {payment.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : payment.method === 'CASH' ? 'Tiền mặt' : payment.method}</p>
                        {payment.transactionCode && <p className="text-xs text-slate-400 mt-0.5">Mã GD: {payment.transactionCode}</p>}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4" onClick={handleRecordPayment} disabled={invoice.status === InvoiceStatus.PAID || invoice.status === InvoiceStatus.CANCELED}>
                    Thêm Ghi Nhận
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
