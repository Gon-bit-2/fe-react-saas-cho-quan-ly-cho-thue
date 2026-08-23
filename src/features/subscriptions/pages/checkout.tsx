import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate, useLocation } from 'react-router'
import { Copy, ArrowLeft, Timer, Lock, Verified, ExternalLink, CheckCircle } from 'lucide-react'
import {
  subscriptionPaymentsControllerCreateCheckout,
  subscriptionPaymentsControllerGetMineById,
} from '@/shared/api/generated/subscription-payments/subscription-payments'
import { toast } from 'sonner'

export type CheckoutData = {
  id: number
  qrContent: string
  amount: number
  accountNo: string
  accountName: string
  description: string
  orderCode: number | string
  checkoutUrl: string
}

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { plan, billingCycle } = location.state || {}

  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59) // 14:59
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!plan || !billingCycle) return

    // Call the API to generate PayOS checkout link
    const initCheckout = async () => {
      try {
        setIsLoading(true)
        const res = await subscriptionPaymentsControllerCreateCheckout({
          planId: plan.id,
          billingCycle: billingCycle === 'annually' ? 'YEARLY' : 'MONTHLY',
        })
        setCheckoutData(res as CheckoutData)
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || 'Không thể khởi tạo thanh toán')
      } finally {
        setIsLoading(false)
      }
    }

    initCheckout()
  }, [plan, billingCycle])

  // Polling to check payment status
  useEffect(() => {
    if (!checkoutData?.id || isSuccess || timeLeft <= 0) return

    const intervalId = setInterval(async () => {
      try {
        const paymentInfo = await subscriptionPaymentsControllerGetMineById(checkoutData.id as number)
        if (paymentInfo.status === 'PAID') {
          setIsSuccess(true)
          toast.success('Thanh toán thành công! Gói của bạn đã được kích hoạt.')
          clearInterval(intervalId)
        } else if (paymentInfo.status === 'CANCELED' || paymentInfo.status === 'FAILED') {
          toast.error('Giao dịch đã bị hủy hoặc thất bại.')
          clearInterval(intervalId)
          navigate('/goi-dich-vu/so-sanh')
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra trạng thái thanh toán', err)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(intervalId)
  }, [checkoutData?.id, isSuccess, timeLeft, navigate])

  useEffect(() => {
    if (timeLeft <= 0 || isSuccess) return

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timerId)
  }, [timeLeft, isSuccess])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép')
  }

  // If no plan is found in state, redirect back
  if (!plan) {
    return (
      <div className="bg-background flex h-[50vh] w-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin gói dịch vụ.</p>
        <Button onClick={() => navigate('/goi-dich-vu/so-sanh')}>Quay lại chọn gói</Button>
      </div>
    )
  }

  const isAnnually = billingCycle === 'annually'
  const baseMonthlyPrice = plan.priceMonthly || 0
  const cycleMonths = isAnnually ? 12 : 1
  const totalPrice = isAnnually ? plan.priceYearly : plan.priceMonthly
  const discount = baseMonthlyPrice * cycleMonths - totalPrice

  const formattedBaseMonthly = new Intl.NumberFormat('vi-VN').format(baseMonthlyPrice)
  const formattedDiscount = new Intl.NumberFormat('vi-VN').format(discount > 0 ? discount : 0)
  const formattedTotal = new Intl.NumberFormat('vi-VN').format(checkoutData?.amount || totalPrice || 0)

  if (isSuccess) {
    return (
      <div className="bg-background flex h-[70vh] w-full flex-col items-center justify-center gap-6">
        <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-3xl font-bold">Thanh toán thành công!</h2>
          <p className="text-muted-foreground text-lg">
            Gói <span className="text-foreground font-semibold">{plan.name}</span> của bạn đã được kích hoạt.
          </p>
        </div>
        <Button onClick={() => navigate('/goi-dich-vu')} className="mt-4 px-8 py-6 text-lg" size="lg">
          Trở về Tổng quan
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background flex min-h-[calc(100vh-64px)] w-full flex-col px-4 pb-12 md:px-8 lg:items-center lg:justify-center">
      <div className="mx-auto mt-8 flex w-full max-w-5xl flex-col gap-8 lg:mt-0 lg:flex-row">
        {/* Order Summary Column */}
        <div className="flex w-full flex-col gap-6 lg:w-5/12">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary mb-4 flex w-fit items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Quay lại chọn gói</span>
          </button>

          <div>
            <h1 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">Thanh toán</h1>
            <p className="text-muted-foreground text-sm">Kiểm tra thông tin đăng ký và tiến hành thanh toán an toàn.</p>
          </div>

          <div className="bg-card border-border relative mt-4 flex flex-col gap-6 overflow-hidden rounded-xl border p-6 shadow-sm">
            <div className="bg-primary/10 absolute -top-16 -right-16 h-32 w-32 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Gói đã chọn
                </span>
                <span className="text-foreground text-xl font-bold">{plan.name}</span>
              </div>
              <div className="bg-primary/10 flex items-center gap-1.5 rounded-full px-3 py-1">
                <Verified className="text-primary h-4 w-4" />
                <span className="text-primary text-xs font-semibold">
                  Thanh toán {isAnnually ? 'hàng năm' : 'hàng tháng'}
                </span>
              </div>
            </div>

            <div className="bg-border relative z-10 h-[1px] w-full"></div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Giá gốc</span>
                <span className="text-foreground text-sm font-medium tabular-nums">
                  {formattedBaseMonthly} VND / tháng
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Chu kỳ</span>
                <span className="text-foreground text-sm font-medium">{cycleMonths} tháng</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span className="text-sm font-medium">Giảm giá năm</span>
                  <span className="text-sm font-medium tabular-nums">- {formattedDiscount} VND</span>
                </div>
              )}
            </div>

            <div className="bg-border relative z-10 h-[1px] w-full"></div>

            <div className="relative z-10 flex items-end justify-between">
              <span className="text-foreground text-base font-semibold">Tổng thanh toán</span>
              <span className="text-primary text-3xl font-bold tabular-nums">
                {formattedTotal} <span className="text-muted-foreground ml-1 text-xl font-semibold">VND</span>
              </span>
            </div>
          </div>

          <div className="bg-muted/50 border-border mt-4 flex items-center gap-3 rounded-lg border p-4">
            <Lock className="text-muted-foreground h-5 w-5" />
            <p className="text-muted-foreground text-xs">
              Thanh toán được bảo mật an toàn bởi hệ thống PayOS. Dữ liệu của bạn được mã hóa.
            </p>
          </div>
        </div>

        {/* Payment QR Column */}
        <div className="relative mt-8 flex w-full flex-col lg:mt-0 lg:w-7/12 lg:pl-8 xl:pl-16">
          <div className="from-border to-primary/30 absolute top-1/2 -left-12 -z-10 hidden h-[2px] w-24 -translate-y-1/2 transform bg-gradient-to-r lg:block"></div>
          <div className="bg-background border-primary absolute top-1/2 -left-[42px] -z-10 hidden h-3 w-3 -translate-y-1/2 transform rounded-full border-2 lg:block"></div>

          <div className="bg-card border-border relative flex min-h-[500px] flex-col items-center justify-center overflow-hidden rounded-2xl border p-8 text-center shadow-xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p className="text-muted-foreground text-sm font-medium">Đang khởi tạo giao dịch an toàn...</p>
              </div>
            ) : !checkoutData ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <p className="text-destructive text-sm font-medium">Có lỗi xảy ra khi tạo mã thanh toán.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                {/* Status Banner */}
                <div className="mb-8 flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
                      Đang chờ thanh toán...
                    </span>
                  </div>
                  <div className="bg-background border-border flex items-center gap-2 rounded-lg border px-3 py-1.5">
                    <Timer className="h-4 w-4 text-amber-600" />
                    <span
                      className={`text-sm font-bold tabular-nums ${timeLeft === 0 ? 'text-destructive' : 'text-foreground'}`}
                    >
                      {timeString}
                    </span>
                  </div>
                </div>

                <h2 className="text-foreground mb-2 text-2xl font-bold">Quét mã QR bằng ứng dụng ngân hàng</h2>
                <p className="text-muted-foreground mb-8 max-w-sm text-sm">
                  Mở ứng dụng ngân hàng của bạn, chọn tính năng quét mã QR và quét mã bên dưới để hoàn tất giao dịch.
                </p>

                {/* QR Code Area */}
                <div className="group relative mb-8 cursor-pointer">
                  <div className="from-primary/20 via-background to-primary/10 absolute -inset-4 rounded-3xl bg-gradient-to-br opacity-50 blur-lg transition-opacity duration-500 group-hover:opacity-100"></div>
                  <div className="border-border relative flex flex-col items-center rounded-2xl border bg-white p-4 shadow-md">
                    {/* Real QR from PayOS */}
                    <div className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-lg bg-white p-2">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(checkoutData.qrContent)}`}
                        alt="QR Code"
                        className="relative z-10 h-full w-full mix-blend-multiply"
                      />

                      {/* Scanning animation line */}
                      <div className="bg-primary absolute top-0 left-0 h-1 w-full animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_8px_2px_rgba(0,74,198,0.5)]"></div>

                      {/* Center logo overlay */}
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <div className="border-border flex h-12 w-12 items-center justify-center rounded-xl border bg-white shadow-sm">
                          <span className="text-primary text-[10px] font-bold">VietQR</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-muted-foreground text-xs font-medium">Cung cấp bởi</span>
                      <span className="text-primary text-lg font-bold tracking-tighter italic">PayOS</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border-border mb-6 flex w-full flex-col gap-3 rounded-xl border p-4 text-left">
                  <div className="border-border flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Thông tin chuyển khoản
                    </span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr_auto] items-center gap-x-2 gap-y-3">
                    <span className="text-muted-foreground text-xs font-medium">Mã Đơn</span>
                    <span className="text-foreground truncate text-sm font-medium">{checkoutData.orderCode}</span>
                    <button
                      onClick={() => copyToClipboard(checkoutData.orderCode.toString())}
                      className="hover:bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <span className="text-muted-foreground text-xs font-medium">Số tiền</span>
                    <span className="text-foreground text-sm font-medium tabular-nums">{formattedTotal} VND</span>
                    <button
                      onClick={() => copyToClipboard(checkoutData.amount?.toString() || formattedTotal)}
                      className="hover:bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <span className="text-muted-foreground text-xs font-medium">Nội dung</span>
                    <span className="text-foreground bg-background truncate rounded px-2 py-1 text-sm font-medium">
                      SUB{checkoutData.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(`SUB${checkoutData.id}`)}
                      className="hover:bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-1 text-[11px] italic">
                    * Xin vui lòng sử dụng mã QR để tự động điền chính xác thông tin ngân hàng thụ hưởng thay vì nhập
                    tay.
                  </p>
                </div>

                <Button
                  onClick={() => (window.location.href = checkoutData.checkoutUrl)}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Mở trang thanh toán PayOS</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
