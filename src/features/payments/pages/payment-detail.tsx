import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPaymentDetail, approvePayment } from '../api';
import { PaymentMethod, PaymentStatus, PaymentDto } from '../types';

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (id) {
      getPaymentDetail(id).then(data => {
        setPayment(data);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setIsApproving(true);
    try {
      await approvePayment(id);
      // Reload payment
      const data = await getPaymentDetail(id);
      setPayment(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">Đang tải...</div>;
  }

  if (!payment) {
    return <div className="p-8">Không tìm thấy khoản thanh toán</div>;
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.SUCCESS:
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Thành công</Badge>;
      case PaymentStatus.FAILED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Thất bại</Badge>;
      case PaymentStatus.CANCELED:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Đã hủy</Badge>;
      case PaymentStatus.PENDING:
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 animate-pulse">Chờ xác nhận</Badge>;
    }
  };

  const getMethodName = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER: return 'Chuyển khoản';
      case PaymentMethod.QR: return 'Quét mã QR';
      case PaymentMethod.CASH: return 'Tiền mặt';
      case PaymentMethod.WALLET: return 'Ví điện tử';
      default: return 'Khác';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.BANK_TRANSFER: return 'account_balance';
      case PaymentMethod.QR: return 'qr_code_2';
      case PaymentMethod.CASH: return 'payments';
      case PaymentMethod.WALLET: return 'account_balance_wallet';
      default: return 'payment';
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 min-h-[calc(100vh-64px)]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/app/thanh-toan">
              <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </Button>
            </Link>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chi Tiết Thanh Toán</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-4">
            PAY-{payment.id.toString().padStart(6, '0')}
            {getStatusBadge(payment.status)}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Biên Lai
          </Button>
          {payment.status === PaymentStatus.PENDING && (
            <Button 
              onClick={handleApprove} 
              disabled={isApproving}
              className="flex items-center gap-2 bg-primary text-white shadow-sm hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Duyệt Thanh Toán
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payment Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Amount Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-sm font-medium text-slate-500 mb-1">Tổng Số Tiền Nhận</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary tracking-tight">{payment.amount.toLocaleString()}</span>
                <span className="text-xl text-primary/70 font-semibold">₫</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-slate-100 my-2 relative z-10"></div>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Thời Gian Thanh Toán</span>
                <span className="text-sm text-slate-900 font-medium">
                  {payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Phương Thức</span>
                <div className="flex items-center gap-1.5 text-sm text-slate-900 font-medium">
                  <span className="material-symbols-outlined text-[18px] text-slate-500">{getMethodIcon(payment.method)}</span>
                  {getMethodName(payment.method)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Nhà Cung Cấp</span>
                <div className="flex items-center gap-2 text-sm text-slate-900 font-medium">
                  <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px] text-primary">{payment.method === PaymentMethod.BANK_TRANSFER ? 'account_balance' : 'qr_code_2'}</span>
                  </div>
                  {payment.provider || 'Thủ công'}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Mã Giao Dịch</span>
                <span className="text-xs text-slate-900 font-medium font-mono p-1 bg-slate-100 rounded break-all max-w-[150px]">
                  {payment.transactionCode || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Related Entities Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-900">Phân Bổ Cho Hóa Đơn</h3>
            
            {payment.invoice && (
              <>
                <Link to={`/app/hoa-don/${payment.invoiceId}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                        <span className="material-symbols-outlined">receipt_long</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900 font-medium group-hover:text-primary transition-colors">
                          {payment.invoice.invoiceCode}
                        </span>
                        <span className="text-xs text-slate-500">
                          {payment.room?.title || 'Phòng thuê'}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">chevron_right</span>
                  </div>
                </Link>

                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-slate-500">Tổng giá trị hóa đơn</span>
                  <span className="text-slate-900 font-medium">{payment.invoice.totalAmount.toLocaleString()} ₫</span>
                </div>
                
                {/* Progress bar indicating payment coverage */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${payment.amount >= payment.invoice.totalAmount ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                    style={{ width: `${Math.min(100, Math.max(0, (payment.amount / payment.invoice.totalAmount) * 100))}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs mt-1">
                  <span className={`${payment.amount >= payment.invoice.totalAmount ? 'text-emerald-600' : 'text-amber-600'} font-medium`}>
                    {Math.round((payment.amount / payment.invoice.totalAmount) * 100)}% Hóa đơn
                  </span>
                  <span className="text-slate-500">
                    Còn lại: {Math.max(0, payment.invoice.totalAmount - payment.amount).toLocaleString()} ₫
                  </span>
                </div>
              </>
            )}
            
            {!payment.invoice && (
              <p className="text-sm text-slate-500 italic">Không có thông tin hóa đơn đính kèm</p>
            )}
          </div>
        </div>

        {/* Right Column: Evidence */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white z-10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500">image</span>
                <span className="text-sm text-slate-900 font-bold">Hình Ảnh Minh Chứng</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded bg-slate-50">
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </Button>
                <a href={payment.evidenceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded bg-slate-50">
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </Button>
                </a>
              </div>
            </div>
            
            {/* Image Viewer Area */}
            <div className="flex-1 bg-slate-50 relative p-4 flex items-center justify-center overflow-hidden min-h-[300px]">
              {payment.evidenceUrl ? (
                <div className="relative max-w-md w-full shadow-lg rounded-lg overflow-hidden group cursor-zoom-in border border-slate-200 bg-white">
                  <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-4xl bg-slate-900/50 rounded-full p-2 backdrop-blur-sm">zoom_in</span>
                  </div>
                  <img src={payment.evidenceUrl} alt="Minh chứng thanh toán" className="w-full h-auto object-contain bg-white" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">hide_image</span>
                  <p className="text-sm">Không có hình ảnh minh chứng</p>
                </div>
              )}
            </div>
            
            {/* Footer Metadata */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-900 font-medium truncate max-w-[200px]">
                    Ghi chú từ người gửi
                  </span>
                  <span className="text-xs text-slate-500">
                    {payment.renterNote || 'Không có ghi chú'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                <span className="text-xs text-slate-700 font-medium">Hệ thống ghi nhận</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
