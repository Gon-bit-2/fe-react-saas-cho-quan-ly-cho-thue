import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock, MessageSquareWarning, Calendar, AlertCircle, ChevronRight } from 'lucide-react'

// Mock Data
const PENDING_REQUESTS = [
  {
    id: 1,
    type: 'Xem phòng',
    user: 'Nguyễn Văn A',
    property: 'Cơ sở 1 - Tôn Thất Thuyết',
    time: '10 phút trước',
    status: 'Chờ phản hồi',
  },
  {
    id: 2,
    type: 'Cọc phòng',
    user: 'Trần Thị B',
    property: 'Cơ sở 2 - Cầu Giấy',
    time: '1 giờ trước',
    status: 'Chờ xác nhận',
  },
]

const EXPIRING_CONTRACTS = [
  { id: 1, room: 'P.101 - CS1', user: 'Lê Hoàng', expireDate: '25/08/2026', daysLeft: 17 },
  { id: 2, room: 'P.204 - CS3', user: 'Phạm Trang', expireDate: '30/08/2026', daysLeft: 22 },
]

const UNPAID_INVOICES = [
  { id: 1, room: 'P.105 - CS1', amount: '4,500,000đ', dueDate: '05/08/2026', daysOverdue: 3 },
  { id: 2, room: 'P.302 - CS2', amount: '3,200,000đ', dueDate: '07/08/2026', daysOverdue: 1 },
]

const OPEN_TICKETS = [
  { id: 1, room: 'P.201 - CS1', issue: 'Hỏng điều hòa', priority: 'Cao', time: '2 giờ trước' },
  { id: 2, room: 'P.104 - CS2', issue: 'Đèn ban công cháy', priority: 'Thấp', time: '1 ngày trước' },
]

export function Component() {
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
            <div className="font-display text-on-surface text-2xl font-bold">12</div>
            <div className="font-label-sm text-on-surface-variant">Yêu cầu mới</div>
          </div>
        </Card>
        <Card className="bg-surface-container-lowest flex items-center gap-4 rounded-xl border-none p-4 shadow-sm">
          <div className="bg-error-container text-on-error-container flex h-12 w-12 items-center justify-center rounded-full">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-error text-2xl font-bold">5</div>
            <div className="font-label-sm text-on-surface-variant">Quá hạn</div>
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
                {PENDING_REQUESTS.map((req) => (
                  <div
                    key={req.id}
                    className="hover:bg-surface-container-lowest/50 flex items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-on-surface">{req.type}</span>
                        <span className="font-body-sm text-on-surface-variant">— {req.user}</span>
                      </div>
                      <div className="font-body-sm text-on-surface-variant">{req.property}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline" className="font-label-sm border-primary/30 text-primary">
                          {req.status}
                        </Badge>
                        <div className="font-body-sm text-on-surface-variant mt-1">{req.time}</div>
                      </div>
                      <Button size="icon" variant="ghost" className="rounded-full">
                        <ChevronRight className="text-on-surface-variant h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                {OPEN_TICKETS.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="hover:bg-surface-container-lowest/50 flex items-center justify-between p-4 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-on-surface">{ticket.issue}</span>
                        {ticket.priority === 'Cao' && (
                          <Badge className="bg-error/10 text-error hover:bg-error/20 font-label-sm border-none">
                            Ưu tiên
                          </Badge>
                        )}
                      </div>
                      <div className="font-body-sm text-on-surface-variant">Phòng {ticket.room}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="font-body-sm text-on-surface-variant">{ticket.time}</div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-on-primary">
                        Xử lý
                      </Button>
                    </div>
                  </div>
                ))}
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
              {EXPIRING_CONTRACTS.map((contract) => (
                <div key={contract.id} className="bg-surface border-surface-border rounded-xl border p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-label-md text-on-surface">{contract.room}</span>
                    <Badge variant="outline" className="font-label-sm border-tertiary text-tertiary bg-tertiary/5">
                      Còn {contract.daysLeft} ngày
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-body-sm text-on-surface-variant">{contract.user}</span>
                    <span className="font-label-sm text-on-surface-variant">Đến: {contract.expireDate}</span>
                  </div>
                </div>
              ))}
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
              {UNPAID_INVOICES.map((invoice) => (
                <div key={invoice.id} className="bg-error/5 border-error/20 flex flex-col gap-1 rounded-xl border p-3">
                  <div className="flex items-start justify-between">
                    <span className="font-label-md text-on-surface">{invoice.room}</span>
                    <span className="font-display text-error font-bold">{invoice.amount}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-body-sm text-on-surface-variant">Trễ {invoice.daysOverdue} ngày</span>
                    <Button variant="link" className="text-primary font-label-sm h-auto p-0">
                      Nhắc nhở
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
