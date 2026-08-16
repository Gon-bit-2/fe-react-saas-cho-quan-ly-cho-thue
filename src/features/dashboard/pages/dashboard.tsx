import { type SVGProps, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { Activity, Building, CircleDollarSign, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getDashboardSummary, getRevenueTrend, getActionCenter } from '../api/dashboard.api'

function lastThirtyDays() {
  const to = new Date()
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 29)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export function DashboardPage() {
  const [range] = useState(lastThirtyDays)

  const summary = useQuery({
    queryKey: ['dashboard', 'summary', range],
    queryFn: () => getDashboardSummary(range),
  })

  const actionCenter = useQuery({
    queryKey: ['dashboard', 'actionCenter'],
    queryFn: () => getActionCenter(),
  })

  const trends = useQuery({
    queryKey: ['dashboard', 'revenueTrend', range],
    queryFn: () => getRevenueTrend({ ...range, groupBy: 'day' }),
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const metrics = summary.data
    ? [
        {
          label: 'Tổng số phòng',
          value: summary.data.rooms.totalRooms,
          detail: `${summary.data.rooms.occupancyRate}% lấp đầy`,
          icon: Building,
        },
        {
          label: 'Tổng doanh thu',
          value: formatCurrency(summary.data.finance.paidAmount),
          detail: `Hóa đơn: ${formatCurrency(summary.data.finance.invoiceTotal)}`,
          icon: CircleDollarSign,
        },
        {
          label: 'Công nợ quá hạn',
          value: formatCurrency(summary.data.finance.overdueDebt),
          detail: `Tổng nợ: ${formatCurrency(summary.data.finance.outstandingDebt)}`,
          icon: AlertTriangle,
          alert: summary.data.finance.overdueDebt > 0,
        },
        {
          label: 'Sự cố đang mở',
          value: summary.data.tickets.open + summary.data.tickets.inProgress,
          detail: `${summary.data.tickets.urgentOpenTickets} sự cố khẩn cấp`,
          icon: AlertCircle,
          alert: summary.data.tickets.urgentOpenTickets > 0,
        },
      ]
    : []

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground mt-1">Theo dõi tình hình hoạt động khu trọ của bạn.</p>
      </div>

      {(summary.isError || trends.isError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
        </div>
      )}

      {summary.isLoading ? (
        <div className="bg-card text-muted-foreground animate-pulse rounded-xl border p-10 text-center">
          Đang tải số liệu...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${metric.alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}
                  >
                    <metric.icon className="h-5 w-5" />
                  </div>
                  {metric.alert && <span className="bg-destructive flex h-2 w-2 animate-pulse rounded-full" />}
                </div>
                <div className="mt-4">
                  <p className="text-muted-foreground text-sm font-medium">{metric.label}</p>
                  <p className="text-foreground mt-1 text-2xl font-bold">{metric.value}</p>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">{metric.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Xu hướng doanh thu</CardTitle>
            <CardDescription>Biểu đồ doanh thu trong 30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            {trends.isLoading ? (
              <div className="text-muted-foreground flex h-[300px] items-center justify-center">Đang tải...</div>
            ) : trends.data?.items && trends.data.items.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.data.items} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="bucket"
                      tickFormatter={(value: unknown) => format(new Date(value as string | number), 'dd/MM')}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(value: unknown) => `${(value as number) / 1000000}M`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [formatCurrency(value as number), 'Doanh thu']}
                      labelFormatter={(label: unknown) => format(new Date(label as string | number), 'dd/MM/yyyy')}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                Không có dữ liệu doanh thu
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle>Cần xử lý</CardTitle>
            <CardDescription>Các tác vụ cần sự chú ý của bạn</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {actionCenter.isLoading ? (
              <div className="text-muted-foreground p-6 text-center">Đang tải...</div>
            ) : actionCenter.data ? (
              <div className="flex flex-col gap-1">
                {actionCenter.data.pendingRequests > 0 && (
                  <Link
                    to="/tenant/rental-requests"
                    className="hover:bg-muted/50 flex items-center justify-between border-b px-6 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Yêu cầu thuê mới</p>
                        <p className="text-muted-foreground text-xs">Chờ duyệt</p>
                      </div>
                    </div>
                    <span className="font-bold text-blue-600">{actionCenter.data.pendingRequests}</span>
                  </Link>
                )}

                {actionCenter.data.unpaidInvoices.total > 0 && (
                  <Link
                    to="/tenant/invoices"
                    className="hover:bg-muted/50 flex items-center justify-between border-b px-6 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-red-100 p-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hóa đơn trễ hạn</p>
                        <p className="text-muted-foreground text-xs">Cần thu tiền</p>
                      </div>
                    </div>
                    <span className="font-bold text-red-600">{actionCenter.data.unpaidInvoices.total}</span>
                  </Link>
                )}

                {actionCenter.data.openTickets > 0 && (
                  <Link
                    to="/tenant/tickets"
                    className="hover:bg-muted/50 flex items-center justify-between border-b px-6 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Sự cố đang mở</p>
                        <p className="text-muted-foreground text-xs">Cần xử lý</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600">{actionCenter.data.openTickets}</span>
                  </Link>
                )}

                {actionCenter.data.expiringContracts > 0 && (
                  <Link
                    to="/tenant/contracts"
                    className="hover:bg-muted/50 flex items-center justify-between px-6 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hợp đồng sắp hết hạn</p>
                        <p className="text-muted-foreground text-xs">&lt; 30 ngày</p>
                      </div>
                    </div>
                    <span className="font-bold text-purple-600">{actionCenter.data.expiringContracts}</span>
                  </Link>
                )}

                {!actionCenter.data.pendingRequests &&
                  !actionCenter.data.unpaidInvoices.total &&
                  !actionCenter.data.openTickets &&
                  !actionCenter.data.expiringContracts && (
                    <div className="text-muted-foreground p-6 text-center text-sm">
                      Không có tác vụ nào cần xử lý ngay lúc này.
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-muted-foreground p-6 text-center">Không có dữ liệu</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Users(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
