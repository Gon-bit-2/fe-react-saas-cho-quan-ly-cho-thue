import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { formatCurrency } from '@/shared/lib/utils'
import { usePlansControllerListAvailable } from '@/shared/api/generated/plans/plans'
import { planApi, type Subscription } from '../api/plan.api'
import { useAuth } from '@/shared/hooks/use-auth'
import { CheckCircle2, Check, Minus, Sparkles } from 'lucide-react'

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

/**
 * Trang so sánh bảng giá các gói cước SaaS dành cho chủ trọ
 * Cho phép chuyển đổi chu kỳ thanh toán tháng/năm và tra cứu ma trận tính năng chi tiết
 */
export const ComparePlansPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually')
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const navigate = useNavigate()
  const { data = [], isLoading } = usePlansControllerListAvailable()

  const { selectedMembership } = useAuth()
  const tenantId = Number(selectedMembership?.tenantId || 0)

  /**
   * Tải gói đăng ký hiện tại để xác định nút "Đang sử dụng"
   */
  useEffect(() => {
    if (!tenantId) return
    const fetchCurrentPlan = async () => {
      try {
        const { data } = await planApi.getCurrentSubscription(tenantId)
        if (data?.subscription?.status === 'ACTIVE') {
          setCurrentSubscription(data.subscription)
        }
      } catch (err) {
        console.error('Failed to fetch current subscription', err)
      }
    }
    fetchCurrentPlan()
  }, [tenantId])

  const plans = Array.isArray(data) ? data : (data as { data?: PlanDto[] })?.data || []

  return (
    <div className="space-y-12 pb-16">
      {/* Header & Toggle chu kỳ thanh toán */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-4 text-center">
        <Badge variant="outline" className="gap-1.5 border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          Bảng Giá Dịch Vụ SaaS
        </Badge>
        <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Chọn Gói Dịch Vụ Phù Hợp Với Quy Mô Khu Trọ Của Bạn
        </h1>
        <p className="max-w-xl text-sm text-slate-500">
          Nâng cấp hoặc chuyển đổi gói bất kỳ lúc nào. Tối ưu hóa vận hành, tự động đối soát ngân hàng và quét chỉ số
          điện nước bằng AI.
        </p>

        {/* Toggle Hàng tháng / Hàng năm */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'rounded-full px-5 py-1.5 text-xs font-semibold transition-all',
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              Thanh toán hàng tháng
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annually')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-semibold transition-all',
                billingCycle === 'annually'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900',
              )}
            >
              <span>Thanh toán hàng năm</span>
              <span className="py-0.2 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-slate-900">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid danh sách các gói cước */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="space-y-4 p-6">
              <div className="h-6 w-28 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-40 animate-pulse rounded bg-slate-100" />
              <div className="space-y-2 pt-4">
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-slate-100" />
              </div>
            </Card>
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Hiện chưa có gói dịch vụ nào sẵn sàng trên hệ thống.
          </div>
        ) : (
          plans.map((plan: PlanDto) => {
            const isPro = plan.code === 'PRO' || plan.code === 'PROFESSIONAL' || plan.code === 'MVP_PRO'
            const isEnterprise = plan.code === 'ENTERPRISE' || plan.maxRooms >= 999999

            const currentPrice = billingCycle === 'annually' ? plan.priceYearly : plan.priceMonthly
            const isFree = currentPrice === 0 && !isEnterprise

            const isCurrentPlan =
              currentSubscription?.planId === plan.id &&
              currentSubscription?.billingCycle === (billingCycle === 'annually' ? 'YEARLY' : 'MONTHLY')

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-200',
                  isPro
                    ? 'border-2 border-blue-600 bg-gradient-to-b from-blue-50/20 to-white shadow-lg md:-translate-y-2'
                    : 'border-slate-200 shadow-sm hover:shadow-md',
                )}
              >
                {isPro && (
                  <div className="bg-blue-600 py-1 text-center text-[11px] font-bold tracking-wider text-white uppercase">
                    Phổ Biến Nhất
                  </div>
                )}

                <CardContent className="flex flex-1 flex-col p-6 sm:p-8">
                  {/* Header gói */}
                  <div className="space-y-2 border-b border-slate-100 pb-6">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="line-clamp-2 min-h-[36px] text-xs text-slate-500">{plan.description}</p>

                    <div className="pt-3">
                      {isFree ? (
                        <div className="font-mono text-3xl font-extrabold text-slate-900">Miễn phí</div>
                      ) : (
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                            {formatCurrency(currentPrice || 0)}
                          </span>
                          <span className="font-sans text-xs text-slate-400">
                            /{billingCycle === 'annually' ? 'năm' : 'tháng'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách tính năng */}
                  <ul className="flex-1 space-y-3 py-6 text-xs text-slate-700">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        Quản lý{' '}
                        <strong>{plan.maxRooms >= 999999 ? 'không giới hạn' : `tối đa ${plan.maxRooms}`}</strong> phòng
                        trọ
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        Tối đa <strong>{plan.maxStaff >= 999999 ? 'không giới hạn' : `${plan.maxStaff}`}</strong> nhân
                        viên quản lý
                      </span>
                    </li>
                    {plan.allowAiOcr && (
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <span>AI OCR nhận diện công tơ điện nước</span>
                      </li>
                    )}
                    {plan.allowWebhookPayment && (
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                        <span>Webhook tự động gạch nợ hóa đơn</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        {isEnterprise
                          ? 'Hỗ trợ kỹ thuật 24/7 chuyên biệt'
                          : isPro
                            ? 'Ưu tiên hỗ trợ nhanh qua Hotline'
                            : 'Hỗ trợ cộng đồng'}
                      </span>
                    </li>
                  </ul>

                  {/* Nút hành động */}
                  <div className="pt-4">
                    <Button
                      variant={isPro ? 'default' : isCurrentPlan ? 'secondary' : 'outline'}
                      disabled={isCurrentPlan}
                      onClick={() => navigate('/goi-dich-vu/thanh-toan', { state: { plan, billingCycle } })}
                      className={cn(
                        'h-10 w-full text-xs font-semibold',
                        isPro && 'bg-blue-600 text-white hover:bg-blue-700',
                      )}
                    >
                      {isCurrentPlan ? 'Gói Hiện Tại' : 'Chọn Gói Này'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Bảng so sánh chi tiết tính năng */}
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Ma Trận Tính Năng Chi Tiết</h2>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Card className="overflow-hidden border-slate-200 text-xs shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-1/3 p-3.5 font-semibold text-slate-700">Tính năng</th>
                  {plans.slice(0, 3).map((p: PlanDto) => (
                    <th key={p.id} className="p-3.5 text-center font-semibold text-slate-900">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Số lượng phòng tối đa</td>
                  {plans.slice(0, 3).map((p: PlanDto) => (
                    <td key={p.id} className="p-3.5 text-center font-mono">
                      {p.maxRooms >= 999999 ? 'Không giới hạn' : p.maxRooms}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Tài khoản nhân sự / quản lý</td>
                  {plans.slice(0, 3).map((p: PlanDto) => (
                    <td key={p.id} className="p-3.5 text-center font-mono">
                      {p.maxStaff >= 999999 ? 'Không giới hạn' : p.maxStaff}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Nhận diện công tơ bằng AI OCR</td>
                  {plans.slice(0, 3).map((p: PlanDto) => (
                    <td key={p.id} className="p-3.5 text-center">
                      {p.allowAiOcr ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-800">Tự động đối soát Webhook Ngân Hàng</td>
                  {plans.slice(0, 3).map((p: PlanDto) => (
                    <td key={p.id} className="p-3.5 text-center">
                      {p.allowWebhookPayment ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-slate-300" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
