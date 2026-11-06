import { useDashboardSummary, useRevenueTrend, useRecentActivity } from '@/shared/api/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Building2, 
  Receipt, 
  Ticket, 
  Wallet,
  TrendingUp,
  AlertCircle
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
import { formatCurrency, formatDate } from '@/shared/lib/utils'

/**
 * Trang Dashboard Tổng quan cho Chủ trọ / Người quản lý vận hành.
 * Hiển thị các chỉ số kinh doanh chính (Doanh thu, Tỷ lệ lấp đầy, Nợ, Sự cố) và biểu đồ xu hướng.
 */
export function Component() {
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary()
  const { data: revenueTrend, isLoading: loadingTrend } = useRevenueTrend()
  const { data: recentActivity, isLoading: loadingActivity } = useRecentActivity(5)

  const typeMap: Record<string, { label: string; tone: string }> = {
    INVOICE: { label: 'Hóa đơn', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
    PAYMENT: { label: 'Thanh toán', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    TICKET: { label: 'Sự cố', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  }

  if (loadingSummary) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="text-sm text-slate-500 font-medium">Đang tải dữ liệu tổng quan...</span>
        </div>
      </div>
    )
  }

  const totalRooms = summary?.totalRooms || 0
  const availableRooms = summary?.availableRooms || 0
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tổng quan hoạt động</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi các chỉ số tài chính, tỷ lệ lấp đầy phòng và các sự kiện vận hành quan trọng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hệ thống ổn định
          </Badge>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tổng doanh thu
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Wallet className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(summary?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Ghi nhận trong tháng này</span>
            </div>
          </CardContent>
        </Card>

        {/* Hóa đơn chưa thu */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hóa đơn chưa thu
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Receipt className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 tabular-nums">
              {summary?.unpaidInvoices || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Cần theo dõi và nhắc thu tiền
            </p>
          </CardContent>
        </Card>

        {/* Tỷ lệ lấp đầy */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tỷ lệ lấp đầy
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {occupancyRate}%
            </div>
            <p className="text-xs text-slate-500 mt-2 tabular-nums">
              {availableRooms} phòng trống / {totalRooms} tổng số phòng
            </p>
          </CardContent>
        </Card>

        {/* Sự cố / Tickets */}
        <Card className="border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sự cố cần xử lý
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <Ticket className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 tabular-nums">
              {summary?.openTickets || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Sự cố và phản ánh của khách
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-4 border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Biểu đồ xu hướng doanh thu
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Dòng tiền thực thu trong 30 ngày gần đây
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {loadingTrend ? (
              <div className="h-[320px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatDate(value)}
                      fontSize={11}
                      tick={{ fill: '#64748B' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(0)}tr`}
                      fontSize={11}
                      tick={{ fill: '#64748B' }}
                      width={45}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Doanh thu']}
                      labelFormatter={(label) => `Ngày: ${formatDate(String(label ?? ''))}`}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#2563EB" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#1D4ED8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 border border-slate-200 bg-white shadow-sm flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-semibold text-slate-900">
              Hoạt động gần đây
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Nhật ký cập nhật hệ thống và giao dịch mới nhất
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 flex-1">
            {loadingActivity ? (
              <div className="h-full min-h-[250px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Chưa có hoạt động nào</p>
                <p className="text-xs text-slate-400 mt-1">Các thao tác của khách và nhân viên sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="relative space-y-4 before:absolute before:inset-y-1 before:left-2 before:w-0.5 before:bg-slate-200">
                {recentActivity.map((activity) => {
                  const typeInfo = typeMap[activity.type] || { label: activity.type, tone: 'bg-slate-50 text-slate-700 border-slate-200' }
                  return (
                    <div key={activity.id} className="relative flex items-start gap-3 pl-6 group">
                      <div className="absolute left-1 top-1.5 h-2.5 w-2.5 rounded-full bg-white border-2 border-blue-600 group-hover:bg-blue-600 transition-colors z-10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.title}
                          </p>
                          <span className="text-xs text-slate-400 whitespace-nowrap tabular-nums">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {activity.description}
                        </p>
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeInfo.tone}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
