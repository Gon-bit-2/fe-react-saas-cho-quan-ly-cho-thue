import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { usePlansControllerListAvailable } from '@/shared/api/generated/plans/plans'

type PlanDto = {
  id: number
  name: string
  description: string
  code: string
  priceMonthly: number
  priceYearly: number
  maxRooms: number
  maxStaff: number
  allowAiOcr: boolean
  allowWebhookPayment: boolean
}

export const ComparePlansPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually')
  const navigate = useNavigate()
  const { data = [], isLoading, error } = usePlansControllerListAvailable()

  // Extract plans array from data response (handles both array and nested data object)
  const plans = Array.isArray(data) ? data : (data as { data?: PlanDto[] })?.data || []

  console.log('API Response:', { data, plans, isLoading, error })

  return (
    <div className="bg-surface-bright flex w-full flex-col pb-16">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center px-4 pt-12 pb-16 md:px-8">
        <div className="bg-muted mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1">
          <span className="bg-primary h-2 w-2 animate-pulse rounded-full"></span>
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Các gói dịch vụ</span>
        </div>
        <h1 className="text-foreground mb-4 max-w-2xl text-center text-4xl leading-tight font-bold tracking-tight">
          Chọn gói phù hợp cho doanh nghiệp của bạn
        </h1>
        <p className="text-muted-foreground mb-12 max-w-xl text-center text-lg">
          Linh hoạt theo quy mô. Nâng cấp bất cứ lúc nào để truy cập các tính năng nâng cao và đội ngũ hỗ trợ.
        </p>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-muted relative z-10 flex items-center rounded-full p-1 shadow-inner">
            <button
              className={cn(
                'relative z-20 rounded-full px-6 py-2 text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-background text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground',
              )}
              onClick={() => setBillingCycle('monthly')}
            >
              Hàng tháng
            </button>
            <button
              className={cn(
                'relative z-20 flex items-center gap-2 rounded-full px-6 py-2 text-sm transition-colors',
                billingCycle === 'annually'
                  ? 'bg-background text-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground font-medium',
              )}
              onClick={() => setBillingCycle('annually')}
            >
              Hàng năm
            </button>
          </div>
          <div className="rounded-md bg-green-100 px-3 py-1">
            <span className="text-xs font-semibold tracking-wide text-green-700 uppercase">
              Tiết kiệm 20% khi trả trước 1 năm
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-20 mx-auto mb-24 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3 md:px-8 lg:gap-8">
        {isLoading ? (
          <div className="text-muted-foreground col-span-full py-12 text-center">Đang tải thông tin gói dịch vụ...</div>
        ) : plans.length === 0 ? (
          <div className="text-muted-foreground col-span-full py-12 text-center">
            Không có gói dịch vụ nào khả dụng lúc này.
          </div>
        ) : (
          plans.map((plan: PlanDto) => {
            const isEnterprise =
              plan.code === 'ENTERPRISE' ||
              plan.priceMonthly === null ||
              plan.priceMonthly === -1 ||
              plan.maxRooms >= 999999
            const isPro = plan.code === 'PRO' || plan.code === 'PROFESSIONAL' || plan.code === 'MVP_PRO'

            const currentPrice = billingCycle === 'annually' ? plan.priceYearly : plan.priceMonthly
            const isFree = currentPrice === 0 && !isEnterprise
            const formattedPrice = new Intl.NumberFormat('vi-VN').format(currentPrice || 0)

            // Features list mapping
            const renderFeatures = (isWhiteText: boolean = false) => {
              const textClass = isWhiteText ? 'text-white' : 'text-foreground'
              const iconClass = isPro || isEnterprise ? 'text-primary' : 'text-muted-foreground'
              return (
                <ul className="mb-10 flex-1 space-y-4">
                  <li className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 text-[20px] ${iconClass}`}>check_circle</span>
                    <span className={`text-sm ${textClass} ${isPro ? 'font-medium' : ''}`}>
                      {plan.maxRooms >= 999999 ? 'Không giới hạn tòa nhà/phòng' : `Tối đa ${plan.maxRooms} phòng`}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 text-[20px] ${iconClass}`}>check_circle</span>
                    <span className={`text-sm ${textClass} ${isPro ? 'font-medium' : ''}`}>
                      {plan.maxStaff >= 999999 ? 'Không giới hạn nhân viên' : `${plan.maxStaff} tài khoản nhân viên`}
                    </span>
                  </li>
                  {plan.allowAiOcr && (
                    <li className="flex items-start gap-3">
                      <span className={`material-symbols-outlined mt-0.5 text-[20px] ${iconClass}`}>check_circle</span>
                      <span className={`text-sm ${textClass}`}>Hỗ trợ AI đọc CCCD/Hóa đơn</span>
                    </li>
                  )}
                  {plan.allowWebhookPayment && (
                    <li className="flex items-start gap-3">
                      <span className={`material-symbols-outlined mt-0.5 text-[20px] ${iconClass}`}>check_circle</span>
                      <span className={`text-sm ${textClass}`}>Tích hợp Webhook Thanh toán</span>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 text-[20px] ${iconClass}`}>check_circle</span>
                    <span className={`text-sm ${textClass}`}>
                      {isEnterprise
                        ? 'Hỗ trợ 24/7 & Quản lý riêng'
                        : isPro
                          ? 'Ưu tiên hỗ trợ qua Email'
                          : 'Hỗ trợ cộng đồng'}
                    </span>
                  </li>
                </ul>
              )
            }

            if (isEnterprise) {
              return (
                <div
                  key={plan.id}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 opacity-50"></div>
                  <div className="bg-primary/20 absolute -right-24 -bottom-24 z-0 h-64 w-64 rounded-full blur-[64px]"></div>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <span className="material-symbols-outlined text-primary text-[24px]">corporate_fare</span>
                      </div>
                      <p className="h-10 text-sm text-slate-300">{plan.description}</p>
                    </div>
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-white">Tùy chỉnh</span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-400">Liên hệ đội ngũ sales</p>
                    </div>
                    {renderFeatures(true)}
                    <Button
                      onClick={() => navigate('/goi-dich-vu/thanh-toan', { state: { plan, billingCycle } })}
                      className="mt-auto flex w-full items-center justify-center gap-2"
                    >
                      Liên hệ ngay
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </Button>
                  </div>
                </div>
              )
            }

            if (isPro) {
              return (
                <div
                  key={plan.id}
                  className="border-primary/20 bg-card relative z-30 flex h-full transform flex-col overflow-hidden rounded-2xl border p-8 shadow-xl md:-translate-y-4"
                >
                  <div className="bg-primary absolute top-0 left-0 h-1.5 w-full"></div>
                  <div className="bg-primary/10 absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1">
                    <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                    <span className="text-primary text-xs font-semibold tracking-wide uppercase">Đề xuất</span>
                  </div>
                  <div className="mb-6 pt-2">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[24px]">domain</span>
                      <h3 className="text-foreground text-2xl font-bold">{plan.name}</h3>
                    </div>
                    <p className="text-muted-foreground h-10 text-sm">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-foreground text-4xl font-bold tracking-tight tabular-nums transition-opacity duration-150">
                        {formattedPrice}
                      </span>
                      <span className="text-muted-foreground text-xl font-normal font-semibold">VND</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                      mỗi tháng, thanh toán{' '}
                      <span className="font-semibold">{billingCycle === 'annually' ? 'hàng năm' : 'hàng tháng'}</span>
                    </p>
                  </div>
                  {renderFeatures()}
                  <Button
                    onClick={() => navigate('/goi-dich-vu/thanh-toan', { state: { plan, billingCycle } })}
                    className="bg-primary mt-auto w-full"
                  >
                    Nâng cấp
                  </Button>
                </div>
              )
            }

            // Standard / Free plan
            return (
              <div
                key={plan.id}
                className="group border-border bg-card relative flex h-full flex-col overflow-hidden rounded-2xl border border-t-[4px] border-t-transparent p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="bg-border group-hover:bg-muted-foreground/30 absolute top-0 left-0 h-1 w-full transition-colors"></div>
                <div className="mb-6">
                  <h3 className="text-foreground mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground h-10 text-sm">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    {isFree ? (
                      <span className="text-foreground text-4xl font-bold tracking-tight">Miễn phí</span>
                    ) : (
                      <>
                        <span className="text-foreground text-4xl font-bold tracking-tight tabular-nums transition-opacity duration-150">
                          {formattedPrice}
                        </span>
                        <span className="text-muted-foreground text-xl font-normal font-semibold">VND</span>
                      </>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs font-medium">
                    {isFree
                      ? 'Mãi mãi'
                      : `mỗi tháng, thanh toán ${billingCycle === 'annually' ? 'hàng năm' : 'hàng tháng'}`}
                  </p>
                </div>
                {renderFeatures()}
                <Button
                  variant="outline"
                  className="mt-auto w-full"
                  onClick={() => navigate('/goi-dich-vu/thanh-toan', { state: { plan, billingCycle } })}
                >
                  Sử dụng gói
                </Button>
              </div>
            )
          })
        )}
      </div>

      {/* Detailed Feature Comparison Matrix */}
      <div className="mx-auto mb-16 w-full max-w-5xl px-4 md:px-8">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-foreground text-3xl font-bold">So sánh tính năng</h2>
          <div className="bg-border h-px flex-1"></div>
        </div>

        <div className="border-border bg-card overflow-hidden rounded-xl border text-sm shadow-sm">
          {/* Matrix Header */}
          <div className="bg-muted grid grid-cols-4 p-4">
            <div className="text-muted-foreground col-span-1 pl-4 font-semibold tracking-wider uppercase">
              Tính năng
            </div>
            {plans.slice(0, 3).map((plan: PlanDto) => (
              <div
                key={`header-${plan.id}`}
                className={cn(
                  'col-span-1 text-center font-semibold tracking-wider uppercase',
                  plan.code === 'PRO' || plan.code === 'PROFESSIONAL'
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground',
                )}
              >
                {plan.name}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="flex flex-col">
            <div className="border-border hover:bg-muted/50 grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Số lượng phòng</div>
              {plans.slice(0, 3).map((plan: PlanDto) => (
                <div
                  key={`rooms-${plan.id}`}
                  className={cn(
                    'col-span-1 text-center',
                    plan.code === 'PRO' || plan.code === 'PROFESSIONAL'
                      ? 'bg-primary/5 -my-2 rounded-md py-2 font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.maxRooms >= 999999 ? 'Không giới hạn' : `Tối đa ${plan.maxRooms}`}
                </div>
              ))}
            </div>

            <div className="border-border hover:bg-muted/50 grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Nhân sự</div>
              {plans.slice(0, 3).map((plan: PlanDto) => (
                <div
                  key={`staff-${plan.id}`}
                  className={cn(
                    'col-span-1 text-center',
                    plan.code === 'PRO' || plan.code === 'PROFESSIONAL'
                      ? 'bg-primary/5 -my-2 rounded-md py-2 font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.maxStaff >= 999999 ? 'Không giới hạn' : `Tối đa ${plan.maxStaff}`}
                </div>
              ))}
            </div>

            <div className="border-border hover:bg-muted/50 grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 flex items-center gap-2 pl-4 font-medium">
                AI & OCR
                <span
                  className="text-muted-foreground material-symbols-outlined cursor-help text-[16px]"
                  title="Hỗ trợ đọc hóa đơn, thẻ CCCD tự động"
                >
                  info
                </span>
              </div>
              {plans.slice(0, 3).map((plan: PlanDto) => (
                <div
                  key={`ai-${plan.id}`}
                  className={cn(
                    'col-span-1 flex justify-center',
                    plan.code === 'PRO' || plan.code === 'PROFESSIONAL'
                      ? 'bg-primary/5 -my-2 rounded-md py-2 font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.allowAiOcr ? (
                    <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  )}
                </div>
              ))}
            </div>

            <div className="hover:bg-muted/50 grid grid-cols-4 items-center p-4 transition-colors">
              <div className="col-span-1 flex items-center gap-2 pl-4 font-medium">
                Webhook Payment
                <span
                  className="text-muted-foreground material-symbols-outlined cursor-help text-[16px]"
                  title="Tự động nhận thông báo thanh toán từ ngân hàng"
                >
                  info
                </span>
              </div>
              {plans.slice(0, 3).map((plan: PlanDto) => (
                <div
                  key={`webhook-${plan.id}`}
                  className={cn(
                    'col-span-1 flex justify-center',
                    plan.code === 'PRO' || plan.code === 'PROFESSIONAL'
                      ? 'bg-primary/5 -my-2 rounded-md py-2 font-semibold'
                      : 'text-muted-foreground',
                  )}
                >
                  {plan.allowWebhookPayment ? (
                    <span className="material-symbols-outlined text-primary text-[20px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
