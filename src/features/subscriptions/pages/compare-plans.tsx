import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'

export const ComparePlansPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually')
  const navigate = useNavigate()

  const prices = {
    monthly: '1,237k',
    annual: '990k',
  }

  const currentPrice = billingCycle === 'annually' ? prices.annual : prices.monthly

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

      {/* Pricing Cards Section */}
      <div className="relative z-20 mx-auto mb-24 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3 md:px-8 lg:gap-8">
        {/* Starter Plan */}
        <div className="bg-card border-border group relative flex h-full flex-col overflow-hidden rounded-2xl border border-t-[4px] border-t-transparent p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="bg-border group-hover:bg-muted-foreground/30 absolute top-0 left-0 h-1 w-full transition-colors"></div>
          <div className="mb-6">
            <h3 className="text-foreground mb-2 text-2xl font-bold">Cơ bản (Starter)</h3>
            <p className="text-muted-foreground h-10 text-sm">Dành cho chủ trọ cá nhân quản lý số lượng ít.</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-foreground text-4xl font-bold tracking-tight">Miễn phí</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs font-medium">Mãi mãi</p>
          </div>
          <ul className="mb-10 flex-1 space-y-4">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-muted-foreground mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">Tối đa 3 tòa nhà</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-muted-foreground mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">1 tài khoản nhân viên</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-muted-foreground mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">Hỗ trợ cộng đồng</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-muted-foreground mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">1GB Dung lượng</span>
            </li>
          </ul>
          <Button variant="outline" className="w-full" disabled>
            Giáng cấp
          </Button>
        </div>

        {/* Professional Plan (Current) */}
        <div className="bg-card border-primary/20 relative z-30 flex h-full transform flex-col overflow-hidden rounded-2xl border p-8 shadow-xl md:-translate-y-4">
          <div className="bg-primary absolute top-0 left-0 h-1.5 w-full"></div>
          <div className="bg-primary/10 absolute top-4 right-4 flex items-center gap-1.5 rounded-full px-3 py-1">
            <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
            <span className="text-primary text-xs font-semibold tracking-wide uppercase">Gói hiện tại</span>
          </div>
          <div className="mb-6 pt-2">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">domain</span>
              <h3 className="text-foreground text-2xl font-bold">Professional</h3>
            </div>
            <p className="text-muted-foreground h-10 text-sm">Công cụ cần thiết cho hệ thống đang phát triển.</p>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-1">
              <span className="text-foreground text-4xl font-bold tracking-tight tabular-nums transition-opacity duration-150">
                {currentPrice}
              </span>
              <span className="text-muted-foreground text-xl font-normal font-semibold">VND</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs font-medium">
              mỗi tháng, thanh toán{' '}
              <span className="font-semibold">{billingCycle === 'annually' ? 'hàng năm' : 'hàng tháng'}</span>
            </p>
          </div>
          <ul className="mb-10 flex-1 space-y-4">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm font-medium">Tối đa 50 tòa nhà</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm font-medium">5 tài khoản nhân viên</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">Quyền truy cập API tiêu chuẩn</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">Ưu tiên hỗ trợ qua Email</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
              <span className="text-foreground text-sm">50GB Dung lượng</span>
            </li>
          </ul>
          <Button variant="secondary" className="bg-secondary flex w-full items-center justify-center gap-2" disabled>
            <span className="material-symbols-outlined text-[18px]">verified</span> Đang sử dụng
          </Button>
        </div>

        {/* Enterprise Plan */}
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 opacity-50"></div>
          <div className="bg-primary/20 absolute -right-24 -bottom-24 z-0 h-64 w-64 rounded-full blur-[64px]"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                <span className="material-symbols-outlined text-primary text-[24px]">corporate_fare</span>
              </div>
              <p className="h-10 text-sm text-slate-300">Giải pháp tùy biến cho doanh nghiệp và chuỗi lớn.</p>
            </div>
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">Tùy chỉnh</span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-400">Liên hệ đội ngũ sales</p>
            </div>
            <ul className="mb-10 flex-1 space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
                <span className="text-sm text-white">Không giới hạn tòa nhà</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
                <span className="text-sm text-white">Không giới hạn nhân viên</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
                <span className="text-sm text-white">API nâng cao & Webhooks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
                <span className="text-sm text-white">Hỗ trợ 24/7 & Quản lý riêng</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">check_circle</span>
                <span className="text-sm text-white">Lưu trữ không giới hạn</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/goi-dich-vu/thanh-toan')}
              className="flex w-full items-center justify-center gap-2"
            >
              Nâng cấp{' '}
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed Feature Comparison Matrix */}
      <div className="mx-auto mb-16 w-full max-w-5xl px-4 md:px-8">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="text-foreground text-3xl font-bold">So sánh tính năng</h2>
          <div className="bg-border h-px flex-1"></div>
        </div>

        <div className="bg-card border-border overflow-hidden rounded-xl border text-sm shadow-sm">
          {/* Matrix Header */}
          <div className="bg-muted grid grid-cols-4 p-4">
            <div className="text-muted-foreground col-span-1 pl-4 font-semibold tracking-wider uppercase">
              Tính năng
            </div>
            <div className="text-muted-foreground col-span-1 text-center font-semibold tracking-wider uppercase">
              Cơ bản
            </div>
            <div className="text-primary col-span-1 text-center font-bold tracking-wider uppercase">Professional</div>
            <div className="text-muted-foreground col-span-1 text-center font-semibold tracking-wider uppercase">
              Enterprise
            </div>
          </div>

          {/* Matrix Rows */}
          <div className="flex flex-col">
            <div className="hover:bg-muted/50 border-border grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Số lượng tòa nhà</div>
              <div className="text-muted-foreground col-span-1 text-center">Tối đa 3</div>
              <div className="bg-primary/5 col-span-1 -my-2 rounded-md py-2 text-center font-semibold">Tối đa 50</div>
              <div className="text-muted-foreground col-span-1 text-center">Không giới hạn</div>
            </div>

            <div className="hover:bg-muted/50 border-border grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Nhân sự</div>
              <div className="text-muted-foreground col-span-1 text-center">1</div>
              <div className="bg-primary/5 col-span-1 -my-2 rounded-md py-2 text-center font-semibold">5</div>
              <div className="text-muted-foreground col-span-1 text-center">Không giới hạn</div>
            </div>

            <div className="hover:bg-muted/50 border-border grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 flex items-center gap-2 pl-4 font-medium">
                Truy cập API{' '}
                <span
                  className="material-symbols-outlined text-muted-foreground cursor-help text-[16px]"
                  title="REST API cho tích hợp ngoài"
                >
                  info
                </span>
              </div>
              <div className="text-muted-foreground col-span-1 flex justify-center">
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </div>
              <div className="bg-primary/5 col-span-1 -my-2 flex justify-center rounded-md py-2 font-semibold">
                Tiêu chuẩn
              </div>
              <div className="text-muted-foreground col-span-1 flex justify-center">Nâng cao</div>
            </div>

            <div className="hover:bg-muted/50 border-border grid grid-cols-4 items-center border-b p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Mức độ hỗ trợ</div>
              <div className="text-muted-foreground col-span-1 text-center">Cộng đồng</div>
              <div className="bg-primary/5 col-span-1 -my-2 rounded-md py-2 text-center font-semibold">
                Ưu tiên qua Email
              </div>
              <div className="text-muted-foreground col-span-1 text-center">24/7 Điện thoại</div>
            </div>

            <div className="hover:bg-muted/50 grid grid-cols-4 items-center p-4 transition-colors">
              <div className="col-span-1 pl-4 font-medium">Lưu trữ dữ liệu</div>
              <div className="text-muted-foreground col-span-1 text-center">1 GB</div>
              <div className="bg-primary/5 col-span-1 -my-2 rounded-md py-2 text-center font-semibold">50 GB</div>
              <div className="text-muted-foreground col-span-1 text-center">Không giới hạn</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
