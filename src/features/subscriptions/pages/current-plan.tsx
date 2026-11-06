import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { SUBSCRIPTION_STATUS_MAP } from '@/shared/constants/status-config'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { planApi } from '../api/plan.api'
import type { Plan, Subscription } from '../api/plan.api'
import { useAuth } from '@/shared/hooks/use-auth'
import { useNavigate } from 'react-router'
import {
  Crown,
  ArrowLeftRight,
  CreditCard,
  Building2,
  DoorOpen,
  Users,
  ScanLine,
  RefreshCw,
  PieChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

/**
 * Trang xem thông tin gói cước hiện tại của chủ nhà trọ
 * Hiển thị hạn mức sử dụng (Khu trọ, Phòng, Nhân viên), tính năng kích hoạt và các tùy chọn gia hạn/nâng cấp
 */
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

  /**
   * Tải thông tin gói đăng ký và hạn mức sử dụng hiện tại
   */
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
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!subscription || !plan) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-slate-500">Không tìm thấy thông tin gói dịch vụ của bạn.</p>
        <Button onClick={() => navigate('/goi-dich-vu/so-sanh')}>Xem các gói cước</Button>
      </div>
    )
  }

  const currentProperties = usageLimits?.currentProperties ?? 0
  const currentRooms = usageLimits?.currentRooms ?? 0
  const currentStaff = usageLimits?.currentStaff ?? 0

  const maxProperties = plan.maxProperties || 0
  const maxRooms = plan.maxRooms || 0
  const maxStaff = plan.maxStaff || 0

  const propertyUsage =
    maxProperties > 0 && maxProperties < 999999
      ? Math.min(Math.round((currentProperties / maxProperties) * 100), 100)
      : 0
  const roomUsage = maxRooms > 0 && maxRooms < 999999 ? Math.min(Math.round((currentRooms / maxRooms) * 100), 100) : 0
  const staffUsage = maxStaff > 0 && maxStaff < 999999 ? Math.min(Math.round((currentStaff / maxStaff) * 100), 100) : 0

  const formatMax = (val: number) => (val === 0 || val >= 999999 ? 'Không giới hạn' : val)

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gói Dịch Vụ Của Bạn</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Theo dõi chu kỳ gia hạn, tiến độ sử dụng tài nguyên và nâng cấp hạn mức.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/goi-dich-vu/lich-su-thanh-toan')}
            className="gap-1.5"
          >
            <CreditCard className="h-4 w-4 text-slate-500" />
            Lịch sử hóa đơn
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/goi-dich-vu/so-sanh')}
            className="gap-1.5 bg-blue-600 text-white hover:bg-blue-700"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Nâng cấp gói
          </Button>
        </div>
      </div>

      {/* Hero Banner: Gói cước hiện tại */}
      <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-sm">
        <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-5">
          <Crown className="h-48 w-48 text-blue-600" />
        </div>

        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="space-y-2">
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Gói đang sử dụng
              </span>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{plan.name}</h2>
                <StatusBadge status={subscription.status} configMap={SUBSCRIPTION_STATUS_MAP} size="default" />
              </div>
              <p className="max-w-lg text-xs text-slate-500">{plan.description}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <div className="font-mono text-3xl font-bold text-blue-600 tabular-nums sm:text-4xl">
                {formatCurrency(subscription.billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly)}
              </div>
              <span className="text-xs text-slate-500">
                Thanh toán theo {subscription.billingCycle === 'YEARLY' ? 'hàng năm (Tiết kiệm 20%)' : 'hàng tháng'}
              </span>
            </div>
          </div>

          {/* Dải thông tin chu kỳ thanh toán */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200/80 bg-white/80 p-4 text-xs backdrop-blur-sm sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-1">
              <span className="font-medium text-slate-400">Chu kỳ tính cước</span>
              <p className="font-semibold text-slate-800">
                {subscription.billingCycle === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-slate-400">Ngày bắt đầu</span>
              <p className="font-mono font-semibold text-slate-800">
                {subscription.startedAt ? formatDate(subscription.startedAt) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-slate-400">Ngày hết hạn / Gia hạn</span>
              <p className="font-mono font-semibold text-slate-800">
                {subscription.expiredAt ? formatDate(subscription.expiredAt) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-slate-400">Phương thức</span>
              <p className="font-semibold text-slate-800">Tự động đối soát VietQR</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Tính năng & Hạn mức sử dụng */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái: Tính năng đi kèm của gói */}
        <div className="space-y-6 lg:col-span-7">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base font-semibold text-slate-900">Tính Năng Kích Hoạt</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <DoorOpen className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="block font-semibold text-slate-900">Quy mô {formatMax(plan.maxRooms)} phòng</span>
                  <p className="text-slate-500">Giới hạn số phòng tạo trên hệ thống</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <span className="block font-semibold text-slate-900">
                    {formatMax(plan.maxStaff)} tài khoản nhân viên
                  </span>
                  <p className="text-slate-500">Phân quyền quản lý và bảo trì</p>
                </div>
              </div>

              {plan.allowAiOcr && (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <ScanLine className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="block font-semibold text-slate-900">AI Quét OCR Đồng Hồ</span>
                    <p className="text-slate-500">Nhận diện chỉ số điện nước tự động</p>
                  </div>
                </div>
              )}

              {plan.allowWebhookPayment && (
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="block font-semibold text-slate-900">Webhook Ngân Hàng</span>
                    <p className="text-slate-500">Tự động gạch nợ hóa đơn khi có tiền về</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Tiến độ tài nguyên sử dụng */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base font-semibold text-slate-900">Mức Độ Sử Dụng</CardTitle>
                </div>
                <span className="text-xs text-slate-400">Hạn mức hiện tại</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 p-6">
              {/* 1. Tòa nhà */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Khu nhà trọ / Tòa nhà
                  </span>
                  <span className="font-mono text-slate-600">
                    {currentProperties} / {formatMax(maxProperties)}
                  </span>
                </div>
                <Progress value={propertyUsage} className="h-2" />
              </div>

              {/* 2. Phòng */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <DoorOpen className="h-3.5 w-3.5 text-blue-500" />
                    Phòng trọ
                  </span>
                  <span className="font-mono text-slate-600">
                    {currentRooms} / {formatMax(maxRooms)}
                  </span>
                </div>
                <Progress value={roomUsage} className="h-2" />
              </div>

              {/* 3. Nhân viên */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Users className="h-3.5 w-3.5 text-amber-500" />
                    Nhân sự quản lý
                  </span>
                  <span className="font-mono text-slate-600">
                    {currentStaff} / {formatMax(maxStaff)}
                  </span>
                </div>
                <Progress value={staffUsage} className="h-2" />
              </div>

              {/* Box gợi ý nâng cấp */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Cần thêm phòng hoặc tính năng?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/goi-dich-vu/so-sanh')}
                  className="h-7 gap-1 p-0 text-xs text-blue-600 hover:text-blue-800"
                >
                  Xem bảng giá <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
