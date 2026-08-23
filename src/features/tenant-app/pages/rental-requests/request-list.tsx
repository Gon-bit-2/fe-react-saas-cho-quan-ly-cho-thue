import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/status-badge'
import { RENTAL_REQUEST_STATUS_MAP } from '@/shared/constants/status-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, FileText, CalendarClock, User, ArrowRight } from 'lucide-react'
import type { RentalRequest, RentalRequestStatus } from '@/types/rental-request'

import { useRentalRequests } from '@/shared/api/rental-requests'

export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RentalRequestStatus | 'all'>('all')

  const { data, isLoading } = useRentalRequests({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const getStatusBadge = (status: RentalRequestStatus) => {
    return <StatusBadge status={status} statusMap={RENTAL_REQUEST_STATUS_MAP} fallbackLabel={status} />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-500">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Yêu cầu thuê phòng</h2>
          <p className="mt-1 text-slate-500">Quản lý và xét duyệt các đăng ký thuê từ khách hàng</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo tên khách hoặc mã phòng..."
            className="border-slate-200 bg-slate-50/50 pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RentalRequestStatus | 'all')}>
          <SelectTrigger className="w-[200px] border-slate-200 bg-slate-50/50">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="NEED_MORE_INFO">Cần thông tin thêm</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="border-b border-slate-200 bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px] py-4 text-center font-semibold text-slate-600">ID</TableHead>
              <TableHead className="py-4 font-semibold text-slate-600">Khách hàng</TableHead>
              <TableHead className="py-4 font-semibold text-slate-600">Phòng quan tâm</TableHead>
              <TableHead className="py-4 font-semibold text-slate-600">Ngày mong muốn</TableHead>
              <TableHead className="py-4 text-center font-semibold text-slate-600">Trạng thái</TableHead>
              <TableHead className="py-4 text-right font-semibold text-slate-600">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                    <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">Không có yêu cầu thuê nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((req: RentalRequest) => (
                <TableRow key={req.id} className="group cursor-default transition-colors hover:bg-slate-50/80">
                  <TableCell className="py-4 text-center font-medium text-slate-500">#{req.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {/* @ts-expect-error: TODO: update types */}
                          {req.renter?.fullName || `Khách thuê #${req.renterId}`}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">Ngày gửi: {formatDate(req.createdAt)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 font-medium text-indigo-600">
                      Phòng #{req.roomId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-slate-700">
                      <CalendarClock className="mr-2 h-4 w-4 text-slate-400" />
                      {req.expectedStartDate ? formatDate(req.expectedStartDate) : 'Chưa xác định'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => navigate(`/yeu-cau-thue/${req.id}`)}
                    >
                      Xử lý <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
