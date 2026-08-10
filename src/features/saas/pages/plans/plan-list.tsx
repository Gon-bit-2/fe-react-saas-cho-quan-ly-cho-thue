import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { plansApi, type IPlanDTO } from '@/shared/api/plans'

export function PlanListPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<IPlanDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await plansApi.list()
        setPlans(response.data)
      } catch (error) {
        console.error('Failed to fetch plans', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  return (
    <div className="animate-in fade-in zoom-in flex w-full flex-col duration-500">
      {/* Hero Banner & Header */}
      <div className="group relative w-full overflow-hidden rounded-3xl shadow-md">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] group-hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBYm_vQQrODYSD-gM61rFLVyfQ2aRrQ43pwRzvQXlaKlZk4tD4AHyDDXtCvbMxJWmiSJVFlTyD3fYb9h00jyIkc_gCMiqK5cyvCZKRZpcAjNAxw_Gm4zf2cWdlqbFHmo4r9aA-aTAS9kF0n4u7ZJw8ejd3QccGxoVoM7mt8tFLy8bSayhtP8qq_L4l1N2x74rU9UIeRiR0jdV02GpB5fv-njjc3TxpHmKKtnmfVfpZyZzoWaSTxMk_l')",
          }}
        />
        <div className="from-on-primary-fixed/95 via-on-primary-fixed/80 absolute inset-0 bg-gradient-to-r to-transparent"></div>
        <div className="p-page-padding-desktop relative z-10 flex w-full flex-col justify-between gap-6 pb-24 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-inverse-primary tracking-[0.2em] uppercase">
              Bảng điều khiển hệ thống
            </span>
            <h1 className="font-display text-display text-on-primary">Quản lý Gói dịch vụ</h1>
          </div>
          <Link
            to="/admin/goi-dich-vu/tao-moi"
            className="bg-primary text-on-primary flex items-center gap-3 rounded-full px-6 py-3.5 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            <span className="font-label-md text-label-md">Thêm gói mới</span>
          </Link>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop relative z-20 -mt-12 flex w-full flex-col gap-6 lg:flex-row">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest flex flex-1 flex-col gap-4 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Tổng Doanh Thu (MRR)
            </span>
            <div className="bg-surface-container text-primary flex h-8 w-8 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-[16px]">payments</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface tabular-nums">124.5M</span>
            <span className="font-body-md text-body-md text-on-surface-variant">VND</span>
          </div>
          {/* Inline SVG Chart */}
          <div className="mt-2 flex h-12 w-full items-end gap-1">
            <div className="bg-surface-container h-[30%] flex-1 rounded-t-sm"></div>
            <div className="bg-surface-container h-[50%] flex-1 rounded-t-sm"></div>
            <div className="bg-surface-container h-[40%] flex-1 rounded-t-sm"></div>
            <div className="bg-surface-container h-[70%] flex-1 rounded-t-sm"></div>
            <div className="bg-surface-container h-[60%] flex-1 rounded-t-sm"></div>
            <div className="bg-primary h-[90%] flex-1 rounded-t-sm shadow-sm"></div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest flex flex-1 flex-col gap-4 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
              Khách hàng (Tenants)
            </span>
            <div className="bg-surface-container text-status-info flex h-8 w-8 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-[16px]">group</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface tabular-nums">842</span>
            <span className="font-label-md text-label-md text-tertiary bg-tertiary-container/30 flex items-center gap-1 rounded-full px-2 py-0.5">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
            </span>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            <div className="font-label-sm text-label-sm text-on-surface-variant flex justify-between">
              <span>Mục tiêu Q3</span>
              <span className="tabular-nums">84%</span>
            </div>
            <div className="bg-surface-container h-1.5 w-full overflow-hidden rounded-full">
              <div className="bg-status-info h-full w-[84%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Image Decorative Card */}
        <div
          className="relative hidden flex-1 overflow-hidden rounded-2xl bg-cover bg-center shadow-lg lg:flex"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfwoJhXNjuD3drrdOe97CWvYM9PTS9teIcoDSxLOt1StQlR5I06WMzHj4nzQvMU4lpyed9S9U5iFv4H3OuTBfy6sMBrkZwEA9c2Lo97oPMwQgp-9pZC4OhnYsMX0Dddz8SN4Lyvs4AIHxQDVviP0lfsb7THxh1OpiGasdlEA_3Ma2IVhN6AjGIjRgu8MaSxHpVnTc2EX0jWfG9_6-MfdGsRsxwFTEZA6TNxaDeBUVFOUPLUlEAyXEP')",
          }}
        >
          <div className="from-on-surface/90 via-on-surface/40 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-6">
            <span className="font-headline-md text-headline-md text-on-primary">Mở rộng thị trường</span>
            <span className="font-body-md text-body-md text-on-primary/80 mt-1">
              Chiến lược đăng ký mới đã kích hoạt
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Plans List Layout */}
      <div className="px-page-padding-mobile md:px-page-padding-desktop relative mt-16 flex w-full gap-8">
        <div className="relative hidden w-12 flex-col items-center pt-12 xl:flex">
          <div className="font-label-md text-label-md text-on-surface-variant -rotate-180 transform tracking-[0.4em] whitespace-nowrap uppercase opacity-60 [writing-mode:vertical-rl]">
            Danh sách phân bổ
          </div>
          <div className="from-outline-variant mt-6 h-64 w-[2px] rounded-full bg-gradient-to-b to-transparent"></div>
        </div>

        {/* List Container */}
        <div className="flex flex-1 flex-col gap-4">
          <div className="bg-surface-container-low hidden w-full items-center rounded-xl px-8 py-3 lg:flex">
            <div className="font-label-sm text-label-sm text-on-surface-variant w-[28%] tracking-widest uppercase">
              Thông tin Gói
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant w-[22%] tracking-widest uppercase">
              Chi phí
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant flex-1 tracking-widest uppercase">
              Giới hạn
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant w-[12%] text-center tracking-widest uppercase">
              Trạng thái
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant w-[10%] text-right tracking-widest uppercase">
              Thao tác
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined text-primary animate-spin text-[32px]">progress_activity</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-on-surface-variant flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined mb-2 text-[48px] opacity-50">inbox</span>
              <p>Chưa có gói dịch vụ nào</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-surface-container-lowest group relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md lg:flex-row lg:items-center lg:px-8 lg:py-6"
              >
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1.5 bg-transparent transition-colors ${plan.status === 'ACTIVE' ? 'group-hover:bg-primary' : 'group-hover:bg-outline-variant'}`}
                ></div>

                <div className="flex w-full items-center gap-5 lg:w-[28%]">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner ${plan.status === 'ACTIVE' ? 'bg-surface text-primary' : 'bg-surface-container text-outline'}`}
                  >
                    <span
                      className="material-symbols-outlined text-[28px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {plan.status === 'ACTIVE' ? 'rocket_launch' : 'corporate_fare'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{plan.name}</span>
                      <span
                        className={`font-label-sm text-label-sm rounded-md px-2.5 py-1 tracking-wide uppercase ${plan.status === 'ACTIVE' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-variant text-on-surface-variant'}`}
                      >
                        {plan.status === 'ACTIVE' ? 'Hoạt động' : 'Đã đóng'}
                      </span>
                    </div>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Chu kỳ: {plan.billingCycle}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1 lg:w-[22%]">
                  <div className="font-headline-md text-headline-md text-on-surface tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(plan.price)}₫{' '}
                    <span className="font-body-md text-body-md text-on-surface-variant font-normal">
                      /{plan.billingCycle === 'MONTHLY' ? 'th' : 'năm'}
                    </span>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-2.5 lg:flex-1">
                  <div className="font-body-md text-on-surface-variant flex flex-col gap-1">
                    <div>Tối đa {plan.maxProperties || '∞'} khu trọ</div>
                    <div>Tối đa {plan.maxRooms || '∞'} phòng</div>
                  </div>
                </div>

                <div className="flex w-full flex-row items-center justify-between py-2 lg:w-[12%] lg:flex-col lg:py-0">
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wide uppercase lg:hidden">
                    Trạng thái
                  </span>
                  <div
                    className={`flex h-6 w-12 cursor-pointer items-center rounded-full p-1 shadow-inner transition-colors ${plan.status === 'ACTIVE' ? 'bg-primary hover:bg-primary-fixed-variant justify-end' : 'bg-surface-variant justify-start opacity-60'}`}
                    title={plan.status === 'ACTIVE' ? 'Đang mở đăng ký' : 'Đã đóng'}
                  >
                    <div
                      className={`h-4 w-4 rounded-full shadow-sm ${plan.status === 'ACTIVE' ? 'bg-on-primary' : 'bg-on-surface-variant'}`}
                    ></div>
                  </div>
                </div>

                <div className="flex w-full items-center justify-end gap-1 lg:w-[10%]">
                  <button
                    onClick={() => navigate(`/admin/goi-dich-vu/${plan.id}/chinh-sua`)}
                    aria-label="Sửa"
                    className="text-on-surface-variant hover:bg-surface hover:text-primary group/btn flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:scale-110">
                      edit
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
