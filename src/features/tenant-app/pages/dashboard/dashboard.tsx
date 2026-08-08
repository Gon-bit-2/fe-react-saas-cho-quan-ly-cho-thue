import { useDashboardSummary, useRevenueTrend, useRecentActivity } from '@/shared/api/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Building2, 
  Receipt,
  Ticket,
  Wallet
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { Badge } from '@/components/ui/badge'

function formatVND(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString('vi-VN')
}

export function Component() {
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary()
  const { data: revenueTrend, isLoading: loadingTrend } = useRevenueTrend()
  const { data: recentActivity, isLoading: loadingActivity } = useRecentActivity(5)

  if (loadingSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Decorative Top Background */}
      <div className="absolute inset-x-0 top-0 h-64 bg-surface-container-high -mt-8 -mx-8 overflow-hidden rounded-b-[40px]">
        <svg className="absolute inset-0 w-full h-full text-surface-container/50 mix-blend-overlay" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0,0 L100,0 L100,100 Q50,0 0,100 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-2 mb-2">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tổng quan hoạt động</h1>
        <p className="font-body-md text-on-surface-variant">Theo dõi các chỉ số quan trọng và tình hình kinh doanh của hệ thống</p>
      </div>

      {/* Summary Cards */}
      <div className="relative z-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface-container-lowest border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="font-label-md text-on-surface-variant uppercase tracking-wider">Tổng doanh thu</CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="font-display text-[32px] font-bold text-primary">
              {formatVND(summary?.totalRevenue || 0)}
            </div>
            <p className="font-label-sm text-status-info mt-1">Doanh thu tháng này</p>
          </CardContent>
        </Card>
        
        <Card className="bg-surface-container-lowest border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="font-label-md text-on-surface-variant uppercase tracking-wider">Hóa đơn chưa thu</CardTitle>
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="font-display text-[32px] font-bold text-error">
              {summary?.unpaidInvoices || 0}
            </div>
            <p className="font-label-sm text-on-surface-variant mt-1">Cần theo dõi thu hồi nợ</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="font-label-md text-on-surface-variant uppercase tracking-wider">Tỷ lệ lấp đầy</CardTitle>
            <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="font-display text-[32px] font-bold text-on-surface">
              {summary?.totalRooms ? Math.round(((summary.totalRooms - summary.availableRooms) / summary.totalRooms) * 100) : 0}%
            </div>
            <p className="font-label-sm text-on-surface-variant mt-1">
              {summary?.availableRooms} phòng trống / {summary?.totalRooms} tổng phòng
            </p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-warning/5 rounded-bl-full -mr-4 -mt-4 group-hover:scale-110 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="font-label-md text-on-surface-variant uppercase tracking-wider">Sự cố (Tickets)</CardTitle>
            <div className="w-10 h-10 rounded-full bg-status-warning/20 flex items-center justify-center text-status-warning">
              <Ticket className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="font-display text-[32px] font-bold text-status-warning">
              {summary?.openTickets || 0}
            </div>
            <p className="font-label-sm text-on-surface-variant mt-1">Sự cố đang chờ xử lý</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="col-span-4 bg-surface-container-lowest border-surface-variant/50 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-surface-variant/30 bg-surface-container-low/30 rounded-t-2xl pb-4">
            <CardTitle className="font-headline-sm text-on-surface">Biểu đồ doanh thu</CardTitle>
            <CardDescription className="font-body-md text-on-surface-variant">
              Xu hướng doanh thu 30 ngày gần đây
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loadingTrend ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      fontSize={12}
                      tick={{ fill: 'var(--color-on-surface-variant)' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000000}M`}
                      fontSize={12}
                      tick={{ fill: 'var(--color-on-surface-variant)' }}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatVND(value), 'Doanh thu']}
                      labelFormatter={(label) => formatDate(label)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--color-surface-container-lowest)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: 'var(--color-primary)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 bg-surface-container-lowest border-surface-variant/50 shadow-sm rounded-2xl flex flex-col">
          <CardHeader className="border-b border-surface-variant/30 bg-surface-container-low/30 rounded-t-2xl pb-4">
            <CardTitle className="font-headline-sm text-on-surface">Hoạt động gần đây</CardTitle>
            <CardDescription className="font-body-md text-on-surface-variant">
              Các sự kiện mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1">
            {loadingActivity ? (
              <div className="h-full min-h-[300px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <div className="relative space-y-6 before:absolute before:inset-y-2 before:left-1.5 before:w-px before:bg-surface-variant">
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="relative flex items-start gap-4 pl-6 group">
                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-surface border-2 border-primary group-hover:bg-primary transition-colors z-10" />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <p className="font-label-md text-on-surface">
                          {activity.title}
                        </p>
                        <span className="font-label-sm text-on-surface-variant whitespace-nowrap ml-2">
                          {new Date(activity.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="font-body-md text-on-surface-variant line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="mt-1">
                        <Badge variant="outline" className="font-label-sm text-[10px] uppercase bg-surface-container text-on-surface-variant border-none">
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
