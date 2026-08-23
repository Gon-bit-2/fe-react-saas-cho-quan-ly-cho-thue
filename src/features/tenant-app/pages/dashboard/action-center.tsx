import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock, MessageSquareWarning, Calendar, AlertCircle, ChevronRight } from 'lucide-react'
import { useDashboardSummary, useActionCenter } from '@/shared/api/dashboard'

export function Component() {
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary()
  const { data: actionCenter, isLoading: isLoadingActionCenter } = useActionCenter()
  const isLoading = isLoadingSummary || isLoadingActionCenter

  const PENDING_REQUESTS = actionCenter?.pendingRequests?.items || []
  const EXPIRING_CONTRACTS = actionCenter?.expiringContracts?.items || []
  const UNPAID_INVOICES = actionCenter?.unpaidInvoices?.items || []
  const OPEN_TICKETS = actionCenter?.openTickets?.items || []

  return (
    <div className="relative flex min-h-[calc(100vh-128px)] flex-col gap-6">
      {/* Decorative Top Background */}
      <div className="bg-primary/5 absolute inset-x-0 top-0 -mx-8 -mt-8 h-64 overflow-hidden rounded-b-[40px]">
        <div className="bg-primary/10 absolute top-[-100px] right-[-50px] h-[300px] w-[300px] rounded-full blur-3xl"></div>
        <div className="bg-tertiary/10 absolute top-[50px] left-[-100px] h-[250px] w-[250px] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mb-2 flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Trung tâm cần xử lý</h1>
        <p className="font-body-md text-on-surface-variant">
          Tổng hợp các đầu việc và yêu cầu cần ưu tiên giải quyết ngay
        </p>
      </div>

      {/* Overview Stats */}
      <div className="relative z-10 mb-2 grid gap-4 md:grid-cols-4">
        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm">
          <div className="bg-primary-container text-on-primary-container flex h-12 w-12 items-center justify-center rounded-full">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-on-surface text-2xl font-bold">
              {isLoading ? '...' : (summary?.openTickets || 0)}
            </div>
            <div className="font-label-sm text-on-surface-variant">Sự cố mở</div>
          </div>
        </Card>
        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm">
          <div className="bg-error-container text-on-error-container flex h-12 w-12 items-center justify-center rounded-full">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-error text-2xl font-bold">
              {isLoading ? '...' : (summary?.unpaidInvoices || 0)}
            </div>
            <div className="font-label-sm text-on-surface-variant">Hóa đơn chưa thanh toán</div>
          </div>
        </Card>
      </div>

      {/* Main Grid: 8 + 4 columns layout */}
      <div className="relative z-10 grid flex-1 gap-6 pb-8 md:grid-cols-12">
        {/* Left Column (8 cols): Priority Tasks */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          {/* Yêu cầu thuê/cọc */}
          <Card className="bg-surface-container-lowest border-surface-variant/50 flex flex-col rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <CardTitle className="font-headline-sm text-on-surface">Yêu cầu cần xử lý</CardTitle>
                <Badge className="bg-error text-on-error font-label-sm hover:bg-error ml-2">2 mới</Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-label-md">
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-surface-variant/30 divide-y">
                {PENDING_REQUESTS.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Chưa có yêu cầu nào cần xử lý.</div>
                ) : (
                  PENDING_REQUESTS.map((req) => (
                    <div
                      key={req.id}
                      className="hover:bg-surface-container-lowest/50 flex items-center justify-between p-4 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-on-surface">Yêu cầu thuê</span>
                          <span className="font-body-sm text-on-surface-variant">— {req.renter?.fullName}</span>
                        </div>
                        <div className="font-body-sm text-on-surface-variant">{req.room?.title}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="outline" className="font-label-sm border-primary/30 text-primary">
                            {req.status}
                          </Badge>
                          <div className="font-body-sm text-on-surface-variant mt-1">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full">
                          <ChevronRight className="text-on-surface-variant h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sự cố (Tickets) */}
          <Card className="bg-surface-container-lowest border-surface-variant/50 flex flex-col rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 flex flex-row items-center justify-between border-b py-4">
              <div className="flex items-center gap-2">
                <div className="bg-status-warning/10 text-status-warning flex h-8 w-8 items-center justify-center rounded-full">
                  <MessageSquareWarning className="h-4 w-4" />
                </div>
                <CardTitle className="font-headline-sm text-on-surface">Phản hồi & Sự cố</CardTitle>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-label-md">
                Đến trang Tickets
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-surface-variant/30 divide-y">
                {OPEN_TICKETS.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">Chưa có sự cố nào.</div>
                ) : (
                  OPEN_TICKETS.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="hover:bg-surface-container-lowest/50 flex items-center justify-between p-4 transition-colors"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-on-surface">{ticket.title}</span>
                          {ticket.priority === 'HIGH' && (
                            <Badge className="bg-error/10 text-error hover:bg-error/20 font-label-sm border-none">
                              Ưu tiên
                            </Badge>
                          )}
                        </div>
                        <div className="font-body-sm text-on-surface-variant">Phòng {ticket.room?.title}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-body-sm text-on-surface-variant">{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-on-primary">
                          Xử lý
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Deadlines and Alerts */}
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
          {/* Hợp đồng sắp hết hạn */}
          <Card className="bg-surface-container-lowest border-surface-variant/50 rounded-2xl shadow-sm">
            <CardHeader className="border-surface-variant/30 border-b py-4">
              <div className="flex items-center gap-2">
                <div className="bg-tertiary/10 text-tertiary flex h-8 w-8 items-center justify-center rounded-full">
                  <Calendar className="h-4 w-4" />
                </div>
                <CardTitle className="font-headline-sm text-on-surface">Hợp đồng sắp hết hạn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              {EXPIRING_CONTRACTS.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">Không có hợp đồng nào.</div>
              ) : (
                EXPIRING_CONTRACTS.map((contract) => {
                  const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                  return (
                    <div key={contract.id} className="bg-surface border-surface-border rounded-xl border p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <span className="font-label-md text-on-surface">{contract.room.title}</span>
                        <Badge variant="outline" className="font-label-sm border-tertiary text-tertiary bg-tertiary/5">
                          Còn {daysLeft > 0 ? daysLeft : 0} ngày
                        </Badge>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="font-body-sm text-on-surface-variant">{contract.renter?.fullName}</span>
                        <span className="font-label-sm text-on-surface-variant">Đến: {new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )
                })
              )}
              <Button
                variant="outline"
                className="font-label-md text-primary border-primary hover:bg-primary/5 mt-2 w-full"
              >
                Xem tất cả hợp đồng
              </Button>
            </CardContent>
          </Card>

          {/* Công nợ trễ hạn */}
          <Card className="bg-surface-container-lowest border-error/30 relative overflow-hidden rounded-2xl shadow-sm">
            <div className="bg-error absolute top-0 left-0 h-full w-1"></div>
            <CardHeader className="border-surface-variant/30 border-b py-4">
              <div className="flex items-center gap-2">
                <CardTitle className="font-headline-sm text-error">Công nợ trễ hạn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4">
              {UNPAID_INVOICES.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">Không có công nợ trễ hạn.</div>
              ) : (
                UNPAID_INVOICES.map((invoice) => (
                  <div key={invoice.id} className="bg-error/5 border-error/20 flex flex-col gap-1 rounded-xl border p-3">
                    <div className="flex items-start justify-between">
                      <span className="font-label-md text-on-surface">{invoice.room.title}</span>
                      <span className="font-display text-error font-bold">{invoice.debtAmount?.toLocaleString()}đ</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="font-body-sm text-on-surface-variant">Trễ {invoice.daysOverdue || 0} ngày</span>
                      <Button variant="link" className="text-primary font-label-sm h-auto p-0">
                        Nhắc nhở
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
