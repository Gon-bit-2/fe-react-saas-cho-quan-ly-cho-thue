import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ClipboardList, 
  Clock, 
  MessageSquareWarning, 
  Calendar, 
  AlertCircle, 
  ChevronRight,
  BellRing
} from 'lucide-react'
import { useDashboardSummary, useActionCenter } from '@/shared/api/dashboard'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { Link } from 'react-router'

/**
 * Trang Trung tâm xử lý (Action Center) dành cho Chủ trọ.
 * Tập hợp các đầu việc ưu tiên cần xử lý ngay: Yêu cầu thuê mới, Sự cố khẩn cấp, Hợp đồng sắp hết hạn và Công nợ quá hạn.
 */
export function Component() {
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary()
  const { data: actionCenter, isLoading: isLoadingActionCenter } = useActionCenter()
  const isLoading = isLoadingSummary || isLoadingActionCenter

  const PENDING_REQUESTS = actionCenter?.pendingRequests?.items || []
  const EXPIRING_CONTRACTS = actionCenter?.expiringContracts?.items || []
  const UNPAID_INVOICES = actionCenter?.unpaidInvoices?.items || []
  const OPEN_TICKETS = actionCenter?.openTickets?.items || []

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trung tâm cần xử lý</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tổng hợp các sự vụ và yêu cầu ưu tiên cần chủ trọ phản hồi ngay
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 py-1 px-3">
            <BellRing className="h-3.5 w-3.5 text-amber-600" />
            Cần hành động
          </Badge>
        </div>
      </div>

      {/* Top Quick Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {isLoading ? '...' : (PENDING_REQUESTS.length || 0)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Yêu cầu thuê chờ duyệt</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {isLoading ? '...' : (summary?.openTickets || 0)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Sự cố đang mở</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {isLoading ? '...' : (EXPIRING_CONTRACTS.length || 0)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Hợp đồng sắp hết hạn</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-11 w-11 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 tabular-nums">
                {isLoading ? '...' : (summary?.unpaidInvoices || 0)}
              </div>
              <div className="text-xs text-slate-500 font-medium">Hóa đơn trễ hạn</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: 8 + 4 columns layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Priority Tasks */}
        <div className="space-y-6 lg:col-span-8">
          {/* Yêu cầu thuê */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Yêu cầu thuê chờ duyệt
                  </CardTitle>
                </div>
                {PENDING_REQUESTS.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none ml-2 text-xs">
                    {PENDING_REQUESTS.length} mới
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs">
                <Link to="/yeu-cau-thue">
                  Xem tất cả
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {PENDING_REQUESTS.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Không có yêu cầu thuê nào đang chờ xử lý.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {PENDING_REQUESTS.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {req.renter?.fullName || 'Khách thuê'}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {formatDate(req.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          Đăng ký phòng: <span className="font-medium text-slate-800">{req.room?.title}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                          {req.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild className="text-xs h-8">
                          <Link to={`/yeu-cau-thue/${req.id}`}>
                            Chi tiết
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sự cố (Tickets) */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <MessageSquareWarning className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Sự cố & Phản ánh của khách
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs">
                <Link to="/ho-tro">
                  Đến trang Hỗ trợ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {OPEN_TICKETS.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Không có sự cố nào đang mở.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {OPEN_TICKETS.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {ticket.title}
                          </span>
                          {ticket.priority === 'URGENT' || ticket.priority === 'HIGH' ? (
                            <Badge className="bg-red-100 text-red-700 border-none text-[10px] px-1.5 py-0 font-medium">
                              Ưu tiên cao
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Phòng: <span className="font-medium text-slate-800">{ticket.room?.title || 'Chung'}</span> • Gửi ngày {formatDate(ticket.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8">
                          <Link to={`/ho-tro/${ticket.id}`}>
                            Xử lý
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Deadlines and Alerts */}
        <div className="space-y-6 lg:col-span-4">
          {/* Hợp đồng sắp hết hạn */}
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Hợp đồng sắp hết hạn
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {EXPIRING_CONTRACTS.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  Không có hợp đồng nào sắp hết hạn trong 30 ngày tới.
                </div>
              ) : (
                EXPIRING_CONTRACTS.map((contract) => {
                  const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  return (
                    <div key={contract.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {contract.room?.title}
                        </span>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] shrink-0">
                          Còn {daysLeft > 0 ? daysLeft : 0} ngày
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                        <span className="truncate">{contract.renter?.fullName}</span>
                        <span className="tabular-nums font-medium">Hạn: {formatDate(contract.endDate)}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full text-xs text-blue-600 border-blue-200 hover:bg-blue-50 mt-1"
              >
                <Link to="/hop-dong">
                  Xem tất cả hợp đồng
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Công nợ trễ hạn */}
          <Card className="border border-red-200 bg-white shadow-sm overflow-hidden">
            <div className="h-1 bg-red-500 w-full" />
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                  <Clock className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-semibold text-red-600">
                  Công nợ cần thu
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {UNPAID_INVOICES.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  Không có khoản nợ quá hạn nào.
                </div>
              ) : (
                UNPAID_INVOICES.map((invoice) => (
                  <div key={invoice.id} className="border border-red-100 bg-red-50/30 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {invoice.room?.title}
                      </span>
                      <span className="text-sm font-bold text-red-600 tabular-nums">
                        {formatCurrency(invoice.debtAmount || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>Quá hạn {invoice.daysOverdue || 0} ngày</span>
                      <Button variant="link" size="sm" asChild className="text-xs text-red-600 h-auto p-0 hover:underline">
                        <Link to={`/hoa-don/${invoice.id}`}>
                          Xem hóa đơn
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
