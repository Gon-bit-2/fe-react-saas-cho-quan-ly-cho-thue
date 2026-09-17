import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router';
import { Copy, ArrowLeft, Timer, ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  subscriptionPaymentsControllerCreateCheckout,
  subscriptionPaymentsControllerGetMineById,
} from '@/shared/api/generated/subscription-payments/subscription-payments';
import { formatCurrency } from '@/shared/lib/utils';
import { toast } from 'sonner';

export type CheckoutData = {
  id: number;
  qrContent: string;
  amount: number;
  accountNo: string;
  accountName: string;
  description: string;
  orderCode: number | string;
  checkoutUrl: string;
};

/**
 * Trang thanh toán mua/nâng cấp gói cước dịch vụ SaaS qua cổng VietQR PayOS
 * Tự động tạo mã QR động, đếm ngược thời gian hết hạn và polling kiểm tra trạng thái thanh toán thành công
 */
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, billingCycle } = location.state || {};

  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59); // 14:59 đếm ngược
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Khởi tạo link thanh toán PayOS từ backend
   */
  useEffect(() => {
    if (!plan || !billingCycle) return;

    const initCheckout = async () => {
      try {
        setIsLoading(true);
        const res = await subscriptionPaymentsControllerCreateCheckout({
          planId: plan.id,
          billingCycle: billingCycle === 'annually' ? 'YEARLY' : 'MONTHLY',
        });
        setCheckoutData(res as unknown as CheckoutData);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err?.response?.data?.message || 'Không thể khởi tạo giao dịch thanh toán');
      } finally {
        setIsLoading(false);
      }
    };

    initCheckout();
  }, [plan, billingCycle]);

  /**
   * Polling định kỳ 3 giây để kiểm tra khi nào ngân hàng báo tiền về
   */
  useEffect(() => {
    if (!checkoutData?.id || isSuccess || timeLeft <= 0) return;

    const intervalId = setInterval(async () => {
      try {
        const paymentInfo = await subscriptionPaymentsControllerGetMineById(
          checkoutData.id as number
        );
        if (paymentInfo.status === 'PAID') {
          setIsSuccess(true);
          toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
          clearInterval(intervalId);
        } else if (paymentInfo.status === 'CANCELED' || paymentInfo.status === 'FAILED') {
          toast.error('Giao dịch đã bị hủy hoặc thất bại.');
          clearInterval(intervalId);
          navigate('/goi-dich-vu/so-sanh');
        }
      } catch (err) {
        console.error('Lỗi kiểm tra trạng thái thanh toán', err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [checkoutData?.id, isSuccess, timeLeft, navigate]);

  /**
   * Bộ đếm ngược thời gian thanh toán
   */
  useEffect(() => {
    if (timeLeft <= 0 || isSuccess) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSuccess]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  /**
   * Sao chép thông tin vào bộ nhớ tạm
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép vào bộ nhớ tạm');
  };

  if (!plan) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-500">Không tìm thấy thông tin gói dịch vụ cần thanh toán.</p>
        <Button onClick={() => navigate('/goi-dich-vu/so-sanh')}>Quay lại bảng giá</Button>
      </div>
    );
  }

  const isAnnually = billingCycle === 'annually';
  const baseMonthlyPrice = plan.priceMonthly || 0;
  const cycleMonths = isAnnually ? 12 : 1;
  const totalPrice = isAnnually ? plan.priceYearly : plan.priceMonthly;
  const discount = baseMonthlyPrice * cycleMonths - totalPrice;

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Giao Dịch Thành Công!</h2>
          <p className="text-sm text-slate-500">
            Gói <strong className="text-slate-900">{plan.name}</strong> của bạn đã được kích hoạt thành công.
          </p>
        </div>
        <Button onClick={() => navigate('/goi-dich-vu')} className="bg-blue-600 text-white">
          Quay về trang quản lý gói
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại chọn gói</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Tóm tắt đơn hàng */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">Thanh Toán Gói Dịch Vụ</h1>
            <p className="text-xs text-slate-500">
              Kiểm tra thông tin chi phí và quét mã VietQR để hoàn tất.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-blue-600 w-full" />
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Gói dịch vụ
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  {isAnnually ? 'Gói năm' : 'Gói tháng'}
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá gốc</span>
                  <span className="font-mono text-slate-700">
                    {formatCurrency(baseMonthlyPrice)}/tháng
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời hạn sử dụng</span>
                  <span className="font-medium text-slate-700">{cycleMonths} tháng</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Ưu đãi trả trước 1 năm</span>
                    <span className="font-mono">- {formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-900">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">
                  {formatCurrency(checkoutData?.amount || totalPrice || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
            <span>Thanh toán tự động 24/7 qua cổng VietQR PayOS an toàn và bảo mật.</span>
          </div>
        </div>

        {/* Cột phải: Mã QR VietQR PayOS */}
        <div className="lg:col-span-7">
          <Card className="border-slate-200 shadow-sm overflow-hidden text-center">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {isLoading ? (
                <div className="py-16 space-y-4">
                  <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Đang khởi tạo mã QR thanh toán PayOS...</p>
                </div>
              ) : !checkoutData ? (
                <div className="py-12 space-y-3">
                  <p className="text-xs text-red-600">Không thể tải thông tin thanh toán.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Thử lại
                  </Button>
                </div>
              ) : (
                <>
                  {/* Banner trạng thái chờ & đếm ngược */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <div className="flex items-center gap-2 text-amber-800 font-medium">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Đang chờ chuyển khoản...</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-900">
                      <Timer className="h-4 w-4" />
                      <span>{timeString}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Quét Mã QR Bằng App Ngân Hàng</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Mở ứng dụng ngân hàng bất kỳ, chọn Quét QR để tự động điền đúng số tiền và nội dung.
                    </p>
                  </div>

                  {/* Ảnh mã QR */}
                  <div className="inline-block p-4 rounded-2xl bg-white border-2 border-blue-100 shadow-md">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                        checkoutData.qrContent
                      )}`}
                      alt="VietQR PayOS"
                      className="w-56 h-56 mx-auto object-contain"
                    />
                    <div className="mt-3 text-[11px] font-semibold text-blue-600 tracking-wider uppercase">
                      VietQR • PayOS
                    </div>
                  </div>

                  {/* Chi tiết chuyển khoản */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Mã đơn hàng:</span>
                      <div className="flex items-center gap-1 font-mono font-semibold text-slate-900">
                        <span>{checkoutData.orderCode}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(checkoutData.orderCode.toString())}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500">Số tiền:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-blue-600">
                        <span>{formatCurrency(checkoutData.amount)}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(checkoutData.amount.toString())}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Nội dung chuyển:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <span>SUB{checkoutData.id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`SUB${checkoutData.id}`)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => (window.location.href = checkoutData.checkoutUrl)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Mở cổng thanh toán PayOS</span>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
