import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getPaymentDetail, approvePayment } from '../api';
import { PaymentMethod, type Payment } from '../types';

export function PaymentReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await approvePayment(id);
      setIsApproveOpen(false);
      navigate(`/thanh-toan/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    // Implement reject payment if API supports it
    console.log("Reject payment", id);
    setIsRejectOpen(false);
    navigate(`/thanh-toan/${id}`);
  };

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">Đang tải...</div>;
  }

  if (!payment) {
    return <div className="p-8">Không tìm thấy khoản thanh toán</div>;
  }

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row gap-6 relative z-10 w-full">
        {/* Left Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/thanh-toan/${id}`}>
                <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Duyệt Thanh Toán <span className="text-slate-500 font-normal">#PAY-{payment.id.toString().padStart(6, '0')}</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Đang duyệt thanh toán chờ xử lý cho hóa đơn {payment.invoice?.invoiceCode}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-2 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">pending</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                    Chờ Phê Duyệt
                  </span>
                  <span className="text-sm text-slate-500 ml-auto">
                    Gửi lúc: {payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                  <div className="bg-slate-50 rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider relative z-10">Số Tiền Nhận</span>
                    <div className="text-3xl font-bold text-primary relative z-10 flex items-baseline gap-1">
                      <span>{payment.amount.toLocaleString()}</span>
                      <span className="text-xl">₫</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 relative z-10">
                      <span className="material-symbols-outlined text-sm text-emerald-500">account_balance</span>
                      <span className="text-xs font-medium text-slate-500">
                        {payment.method === PaymentMethod.BANK_TRANSFER ? 'Chuyển khoản' : 'Khác'}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-center justify-center opacity-40">
                    <span className="material-symbols-outlined text-3xl text-slate-900">arrow_forward</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider relative z-10">Công Nợ Hóa Đơn</span>
                    <div className="text-3xl font-bold text-slate-900 relative z-10 flex items-baseline gap-1">
                      <span>{payment.invoice?.totalAmount?.toLocaleString() || '0'}</span>
                      <span className="text-xl">₫</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 relative z-10">
                      <span className="material-symbols-outlined text-sm text-slate-500">receipt_long</span>
                      <span className="text-xs font-medium text-slate-500">
                        Hóa đơn {payment.invoice?.invoiceCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base text-slate-500">Dự kiến sau khi duyệt</span>
                  <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-lg">
                    <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
                    <span className="text-lg font-semibold text-emerald-600 flex items-baseline gap-1">
                      Số dư: 
                      <span className="text-2xl font-bold ml-1">
                        {payment.invoice ? Math.max(0, payment.invoice.totalAmount - payment.amount).toLocaleString() : '0'}
                      </span> 
                      <span className="text-base font-normal">₫</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-2xl font-bold text-slate-900">Minh Chứng</h2>
            <div className="bg-white rounded-xl shadow-sm p-1 border border-slate-200">
              {payment.evidenceUrl ? (
                <div 
                  className="relative w-full h-80 rounded-lg overflow-hidden group cursor-pointer bg-slate-50 flex items-center justify-center"
                  style={{ backgroundImage: `url('${payment.evidenceUrl}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                >
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-slate-900 font-medium px-6 py-3 rounded-full flex items-center gap-2 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                      <span className="material-symbols-outlined text-xl">zoom_in</span>
                      Xem Toàn Màn Hình
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-80 rounded-lg overflow-hidden flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">hide_image</span>
                  <p>Không có ảnh minh chứng</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Action Panel */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col gap-6 shrink-0">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
            <span className="material-symbols-outlined text-amber-500 mt-0.5">warning</span>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Cảnh Báo Kiểm Tra</span>
              <span className="text-xs text-slate-600">Vui lòng đối chiếu kỹ số tiền chuyển khoản với công nợ hóa đơn trước khi phê duyệt.</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Thao Tác</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Người Nộp</span>
                  <span className="text-sm font-medium text-slate-900">{payment.payer?.fullName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Phòng</span>
                  <span className="text-sm font-medium text-slate-900">{payment.room?.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Mã Giao Dịch</span>
                  <span className="text-sm font-medium text-slate-900 font-mono">{payment.transactionCode || 'N/A'}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setIsApproveOpen(true)}
                className="w-full h-12 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-xl">check</span>
                Duyệt Thanh Toán
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setIsRejectOpen(true)}
                className="w-full h-12 flex items-center justify-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <span className="material-symbols-outlined text-xl">close</span>
                Từ Chối
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt Thanh Toán?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn duyệt khoản thanh toán này? Thao tác này sẽ ghi nhận hóa đơn <span className="font-semibold text-slate-900">{payment.invoice?.invoiceCode}</span> đã được thanh toán và cập nhật sổ quỹ.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center mt-2">
            <span className="text-sm text-slate-500">Số tiền ghi nhận</span>
            <span className="text-sm font-bold text-slate-900">{payment.amount.toLocaleString()} ₫</span>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsApproveOpen(false)}>Hủy</Button>
            <Button onClick={handleApprove} disabled={isSubmitting} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check</span> Xác Nhận Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Từ Chối Thanh Toán</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp lý do từ chối khoản thanh toán này. Thông tin này sẽ được hiển thị cho người thuê.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Label>Lý do từ chối <span className="text-red-500">*</span></Label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none h-32" 
              placeholder="Ví dụ: Số tiền chuyển khoản không khớp với hóa đơn..."
            ></textarea>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
            <Button onClick={handleReject} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
