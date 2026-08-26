import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ticketApi, type GetTicketsParams } from '../api/ticket.api'
import type { TicketSummary, TicketStatus, TicketPriority } from '../api/types'

export function TicketListPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined, page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true)
      try {
        const queryParams = { ...filters }
        if (queryParams.status === 'all') delete queryParams.status
        if (queryParams.priority === 'all') delete queryParams.priority
        if (!queryParams.search) delete queryParams.search

        const response = await ticketApi.getTickets(queryParams as GetTicketsParams)
        setTickets(response.data)
        setTotal(response.meta.total)
      } catch (error) {
        console.error('Failed to load tickets', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTickets()
  }, [filters])

  const getPriorityBadge = (priority: TicketPriority) => {
    return <StatusBadge status={priority} statusMap={TICKET_PRIORITY_MAP} fallbackLabel={priority} />
  }

  const getStatusBadge = (status: TicketStatus) => {
    return <StatusBadge status={status} statusMap={TICKET_STATUS_MAP} fallbackLabel={status} />
  }

  return (
    <div className="bg-background flex h-full min-h-[calc(100vh-64px)] w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Danh Sách Hỗ Trợ (Tickets)</h1>
          <p className="text-sm text-slate-500">Quản lý và xử lý các yêu cầu hỗ trợ từ người thuê.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Tài sản</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả tài sản" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tài sản</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Trạng thái</label>
          <Select onValueChange={(val) => setFilters((prev) => ({ ...prev, status: val as TicketStatus | 'all' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
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
        </div>

        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Mức độ</label>
          <Select onValueChange={(val) => setFilters((prev) => ({ ...prev, priority: val as TicketPriority | 'all' }))}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả mức độ" />
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

        <div className="relative min-w-[250px] flex-1">
          <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            search
          </span>
          <Input 
            className="pl-10" 
            placeholder="Tìm kiếm mã ticket, tiêu đề..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-24 font-semibold text-slate-500 uppercase">Mã</TableHead>
                <TableHead className="w-[30%] font-semibold text-slate-500 uppercase">Vấn đề</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Phòng / Khu</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Người thuê</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Mức độ</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Trạng thái</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Người xử lý</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Cập nhật</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-slate-500">
                    Không tìm thấy ticket nào
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="group cursor-pointer hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-500">
                      <Link to={`/ho-tro/${ticket.id}`}>#TK-{ticket.id}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="mb-1 font-medium text-slate-900">{ticket.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{ticket.room?.name || `Phòng ${ticket.roomId}`}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                          {ticket.createdBy?.fullName?.substring(0, 2).toUpperCase() || 'NA'}
                        </div>
                        <span>{ticket.createdBy?.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      {ticket.assignedToUser ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {ticket.assignedToUser.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{ticket.assignedToUser.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa phân công</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {ticket.updatedAt 
                        ? new Date(ticket.updatedAt).toLocaleDateString('vi-VN') 
                        : (ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/ho-tro/${ticket.id}`}>
                            <DropdownMenuItem>
                              <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
                              Xem chi tiết
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem>
                            <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
                            Phân công
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

        {/* Pagination */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="text-sm text-slate-500">
            Hiển thị {tickets.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} đến{' '}
            {Math.min(filters.page * filters.limit, total)} trong số {total} mục
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              {filters.page}
            </Button>
            {total > filters.page * filters.limit && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
