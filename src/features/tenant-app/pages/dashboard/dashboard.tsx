import { useDashboardSummary, useRevenueTrend, useRecentActivity } from '@/shared/api/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Building2, 
  DoorOpen, 
  FileText, 
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tổng quan hoạt động</h2>
        <p className="text-muted-foreground">Theo dõi các chỉ số quan trọng của tổ chức</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatVND(summary?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hóa đơn chưa thanh toán</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {summary?.unpaidInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cần theo dõi thu hồi nợ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.totalRooms ? Math.round(((summary.totalRooms - summary.availableRooms) / summary.totalRooms) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.availableRooms} phòng trống / {summary?.totalRooms} tổng phòng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự cố đang mở (Tickets)</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {summary?.openTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chờ xử lý</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>
              Xu hướng doanh thu 30 ngày gần đây
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loadingTrend ? (
              <div className="h-[350px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      fontSize={12}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000000}M`}
                      fontSize={12}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatVND(value), 'Doanh thu']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-primary, #0f172a)" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Các thay đổi mới nhất trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              </div>
            ) : (
              <div className="space-y-8">
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString('vi-VN')}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase">
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
