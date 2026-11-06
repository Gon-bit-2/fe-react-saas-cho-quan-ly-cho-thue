import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { useQuery } from '@tanstack/react-query'
import { useProperties } from '@/shared/api/properties'
import { ticketApi, type GetTicketsParams } from '../api/ticket.api'
import type { TicketStatus, TicketPriority } from '../api/types'
import {
  LifeBuoy,
  Search,
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  UserCheck,
  RefreshCw,
} from 'lucide-react'

/**
 * Trang danh sách yêu cầu sự cố và hỗ trợ từ khách thuê
 * Hỗ trợ lọc theo bất động sản, trạng thái, mức độ ưu tiên và tìm kiếm từ khóa
 */
export function TicketListPage() {
  const navigate = useNavigate()
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []
  const [filters, setFilters] = useState<{
    page: number
    limit: number
    status?: TicketStatus | 'all'
    priority?: TicketPriority | 'all'
    search?: string
  }>({
    page: 1,
    limit: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')

  // Tự động debounce khi người dùng gõ từ khóa tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm || undefined, page: 1 }))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  /**
   * Tải danh sách yêu cầu hỗ trợ từ API qua TanStack Query (tránh cascading render từ useEffect)
   */
  const {
    data: ticketsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const queryParams: Record<string, unknown> = { ...filters }
      if (queryParams.status === 'all') delete queryParams.status
      if (queryParams.priority === 'all') delete queryParams.priority
      if (!queryParams.search) delete queryParams.search

      return ticketApi.getTickets(queryParams as unknown as GetTicketsParams)
    },
  })

  const tickets = useMemo(() => ticketsResponse?.data || [], [ticketsResponse])
  const total = ticketsResponse?.meta?.total || 0

  /**
   * Thống kê KPI tóm tắt số lượng ticket
   */
  const stats = useMemo(() => {
    const openTickets = tickets.filter((t) => t.status === 'OPEN').length
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'WAITING_RENTER').length
    const urgentTickets = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length

    return { openTickets, inProgress, urgentTickets, resolved }
  }, [tickets])

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút thao tác */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sự Cố & Yêu Cầu Hỗ Trợ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tiếp nhận, phân công nhân viên bảo trì và theo dõi tiến độ xử lý khiếu nại của khách thuê.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Thẻ KPI thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Yêu Cầu Mới"
          value={stats.openTickets}
          description="Cần phân công xử lý"
          icon={<LifeBuoy className="h-4 w-4" />}
          tone="blue"
        />
        <MetricCard
          title="Đang Tiến Hành"
          value={stats.inProgress}
          description="Đã có thợ/đang sửa chữa"
          icon={<Clock className="h-4 w-4" />}
          tone="amber"
        />
        <MetricCard
          title="Mức Độ Khẩn Cấp"
          value={stats.urgentTickets}
          description="Cần ưu tiên xử lý ngay"
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="rose"
        />
        <MetricCard
          title="Đã Giải Quyết"
          value={stats.resolved}
          description="Hoàn thành trong kỳ này"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="emerald"
        />
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <div className="relative w-full flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm kiếm mã ticket, tiêu đề, nội dung sự cố..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-slate-200 bg-slate-50 pl-9 text-sm"
              />
            </div>

            <div className="flex w-full flex-wrap items-center gap-2.5 md:w-auto">
              {/* Lọc theo Khu trọ */}
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] border-slate-200 bg-slate-50 text-sm">
                  <Building2 className="mr-1.5 h-4 w-4 text-slate-400" />
                  <SelectValue placeholder="Tất cả khu trọ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu trọ</SelectItem>
                  {properties.map((prop) => (
                    <SelectItem key={prop.id} value={String(prop.id)}>
                      {prop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lọc theo Trạng thái */}
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: val as TicketStatus | 'all',
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[160px] border-slate-200 bg-slate-50 text-sm">
                  <SelectValue placeholder="Trạng thái: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="OPEN">Mới tạo</SelectItem>
                  <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
                  <SelectItem value="WAITING_RENTER">Chờ phản hồi</SelectItem>
                  <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
                  <SelectItem value="CLOSED">Đã đóng</SelectItem>
                </SelectContent>
              </Select>

              {/* Lọc theo Mức độ */}
              <Select
                onValueChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: val as TicketPriority | 'all',
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[150px] border-slate-200 bg-slate-50 text-sm">
                  <SelectValue placeholder="Mức độ: Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bảng danh sách Ticket */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[100px]">Mã Ticket</TableHead>
                <TableHead className="w-[30%]">Vấn Đề / Tiêu Đề</TableHead>
                <TableHead>Phòng Thuê</TableHead>
                <TableHead>Người Báo Cáo</TableHead>
                <TableHead>Mức Độ</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Người Phụ Trách</TableHead>
                <TableHead className="text-right">Cập Nhật</TableHead>
                <TableHead className="w-[80px] text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-28" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState
                      icon={LifeBuoy}
                      title="Không tìm thấy yêu cầu hỗ trợ nào"
                      description="Hiện tại chưa có sự cố hoặc khiếu nại nào phù hợp với bộ lọc đã chọn."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => navigate(`/ho-tro/${ticket.id}`)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-slate-500">#TK-{ticket.id}</TableCell>

                    <TableCell>
                      <div className="font-medium text-slate-900 transition-colors group-hover:text-blue-600">
                        {ticket.title}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-semibold text-slate-700">
                        {ticket.room?.name || `Phòng ${ticket.roomId}`}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                          {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'KH'}
                        </div>
                        <span className="text-xs font-medium text-slate-800">
                          {ticket.createdBy?.fullName || 'Khách thuê'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={ticket.priority} configMap={TICKET_PRIORITY_MAP} size="sm" />
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={ticket.status} configMap={TICKET_STATUS_MAP} size="sm" />
                    </TableCell>

                    <TableCell>
                      {ticket.assignedToUser ? (
                        <div className="flex w-fit items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                          <span>{ticket.assignedToUser.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right font-mono text-xs text-slate-500 tabular-nums">
                      {ticket.updatedAt
                        ? new Date(ticket.updatedAt).toLocaleDateString('vi-VN')
                        : ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString('vi-VN')
                          : '-'}
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/ho-tro/${ticket.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <span className="text-xs text-slate-500">
            Hiển thị {tickets.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} đến{' '}
            {Math.min(filters.page * filters.limit, total)} trong số {total} ticket
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
              Trang {filters.page}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-slate-600"
              disabled={total <= filters.page * filters.limit}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
