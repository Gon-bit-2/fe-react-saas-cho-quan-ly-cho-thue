import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { planApi } from '../api/plan.api'
import type { Plan, Subscription } from '../api/plan.api'
import { useAuth } from '@/shared/hooks/use-auth'
import { useNavigate } from 'react-router'

export const CurrentPlanPage = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [usageLimits, setUsageLimits] = useState<{
    currentProperties: number
    currentRooms: number
    currentStaff: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const { selectedMembership } = useAuth()
  const tenantId = Number(selectedMembership?.tenantId || 0)

  useEffect(() => {
    if (!tenantId) return

    const fetchData = async () => {
      try {
        const { data } = await planApi.getCurrentSubscription(tenantId)
        setSubscription(data.subscription)
        setUsageLimits(data.usageLimits)
        if (data.subscription?.plan) {
          setPlan(data.subscription.plan)
        }
      } catch (error) {
        console.error('Failed to fetch subscription', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [tenantId])

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Đang tải thông tin gói...</div>
  }

  if (!subscription || !plan) {
    return <div className="text-destructive p-8">Không tìm thấy thông tin gói.</div>
  }

  // Use real data from API or fallback to 0
  const currentProperties = usageLimits?.currentProperties ?? 0
  const currentRooms = usageLimits?.currentRooms ?? 0
  const currentStaff = usageLimits?.currentStaff ?? 0

  const maxProperties = plan.maxProperties || 0
  const maxRooms = plan.maxRooms || 0
  const maxStaff = plan.maxStaff || 0

  const propertyUsage =
    maxProperties > 0 && maxProperties < 999999
      ? Math.min((currentProperties / maxProperties) * 100, 100)
      : currentProperties > 0
        ? 100
        : 0
  const roomUsage =
    maxRooms > 0 && maxRooms < 999999 ? Math.min((currentRooms / maxRooms) * 100, 100) : currentRooms > 0 ? 100 : 0
  const staffUsage =
    maxStaff > 0 && maxStaff < 999999 ? Math.min((currentStaff / maxStaff) * 100, 100) : currentStaff > 0 ? 100 : 0

  const formatMax = (val: number) => (val === 0 || val >= 999999 ? 'Không giới hạn' : val)

  return (
    <div className="flex flex-col gap-6">
      <div className="text-foreground mb-2 flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-[32px]">workspace_premium</span>
        <h1 className="text-3xl font-bold tracking-tight">Gói dịch vụ</h1>
      </div>

      {/* Top Banner - Current Plan */}
      <div className="bg-card border-border relative overflow-hidden rounded-2xl border shadow-xl">
        <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent"></div>
        <div className="relative p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Gói hiện tại
              </span>
              <div className="flex items-end gap-4">
                <span className="text-foreground text-5xl font-bold">{plan.name}</span>
                {subscription.status === 'ACTIVE' && (
                  <Badge
                    variant="default"
                    className="mb-1 flex items-center gap-1.5 bg-green-100 px-3 py-1 text-green-800 hover:bg-green-100"
                  >
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Đang hoạt động
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-primary text-3xl font-bold">
                {new Intl.NumberFormat('vi-VN').format(
                  subscription.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly,
                )}
                <span className="text-muted-foreground text-lg font-normal"> VNĐ</span>
              </span>
              <span className="text-muted-foreground text-sm">
                Thanh toán theo {subscription.billingCycle === 'YEARLY' ? 'năm' : 'tháng'}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 border-l-primary mb-8 grid grid-cols-1 gap-8 rounded-xl border-l-4 p-6 pb-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">Chu kỳ thanh toán</span>
              <span className="text-base font-medium">
                {subscription.billingCycle === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">Hóa đơn tiếp theo</span>
              <span className="font-mono text-base font-medium">
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(subscription.expiredAt))}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">Bắt đầu chu kỳ</span>
              <span className="font-mono text-base font-medium">
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(subscription.startedAt))}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-medium">Kết thúc chu kỳ</span>
              <span className="font-mono text-base font-medium">
                {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(subscription.expiredAt))}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button className="flex items-center gap-2" onClick={() => navigate('/goi-dich-vu/so-sanh')}>
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Đổi gói
            </Button>
            <Button
              variant="outline"
              className="bg-background flex items-center gap-2"
              onClick={() => navigate('/goi-dich-vu/lich-su-thanh-toan')}
            >
              <span className="material-symbols-outlined text-[18px]">credit_card</span>
              Quản lý thanh toán
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Included Features */}
        <div className="bg-card border-border relative overflow-hidden rounded-2xl border p-8 shadow-md">
          <div className="bg-primary/5 pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full blur-3xl"></div>
          <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            Tính năng đi kèm
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-muted flex items-center gap-3 rounded-xl p-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-[20px]">domain</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Tối đa {plan.maxRooms >= 999999 ? 'Không giới hạn' : plan.maxRooms} phòng
                </span>
                <span className="text-muted-foreground text-sm">Quản lý số phòng trọ theo gói</span>
              </div>
            </div>
            <div className="bg-muted flex items-center gap-3 rounded-xl p-4">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  Tối đa {plan.maxStaff >= 999999 ? 'Không giới hạn' : plan.maxStaff} nhân viên
                </span>
                <span className="text-muted-foreground text-sm">Phân quyền quản lý nhà trọ</span>
              </div>
            </div>
            {plan.allowAiOcr && (
              <div className="bg-muted flex items-center gap-3 rounded-xl p-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-[20px]">document_scanner</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">AI & OCR</span>
                  <span className="text-muted-foreground text-sm">Quét CCCD & Hóa đơn điện nước</span>
                </div>
              </div>
            )}
            {plan.allowWebhookPayment && (
              <div className="bg-muted flex items-center gap-3 rounded-xl p-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <span className="material-symbols-outlined text-[20px]">autorenew</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Thanh toán tự động</span>
                  <span className="text-muted-foreground text-sm">Tự động nhận diện thanh toán</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div className="flex flex-col gap-6">
          <div className="bg-card group border-border relative overflow-hidden rounded-2xl border p-8 shadow-md">
            <h3 className="mb-6 flex items-center justify-between text-xl font-semibold">
              Mức sử dụng
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">pie_chart</span>
            </h3>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-symbols-outlined text-muted-foreground text-[16px]">
                      real_estate_agent
                    </span>
                    Tòa nhà / Khu trọ
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {currentProperties} / {formatMax(maxProperties)}
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${propertyUsage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-symbols-outlined text-muted-foreground text-[16px]">meeting_room</span>
                    Phòng trọ
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {currentRooms} / {formatMax(maxRooms)}
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${roomUsage}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="material-symbols-outlined text-muted-foreground text-[16px]">group</span>
                    Nhân viên
                  </span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {currentStaff} / {formatMax(maxStaff)}
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${staffUsage}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-secondary/30 mt-4 rounded-xl p-4 text-center">
                <span className="text-muted-foreground mb-2 block text-sm">Cần thêm tài nguyên?</span>
                <button
                  className="text-primary text-sm font-medium hover:underline"
                  onClick={() => navigate('/goi-dich-vu/so-sanh')}
                >
                  Xem các gói nâng cấp
                </button>
              </div>
            </div>
          </div>

          <div className="bg-card border-border flex items-start gap-4 rounded-2xl border p-6 shadow-sm">
            <div className="bg-secondary/30 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <span className="material-symbols-outlined text-muted-foreground text-[24px]">help_center</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Cần hỗ trợ về thanh toán?</span>
              <span className="text-muted-foreground mb-2 text-sm">Đội ngũ hỗ trợ 24/7 luôn sẵn sàng.</span>
              <button className="text-primary flex items-center gap-1 text-sm font-medium hover:underline">
                Liên hệ hỗ trợ <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
