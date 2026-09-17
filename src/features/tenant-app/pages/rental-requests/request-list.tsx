import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { RENTAL_REQUEST_STATUS_MAP } from '@/shared/constants/status-config'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, FileText, CalendarClock, User, ArrowRight, Home } from 'lucide-react'
import type { RentalRequest, RentalRequestStatus } from '@/types/rental-request'
import { useRentalRequests } from '@/shared/api/rental-requests'
import { formatDate } from '@/shared/lib/utils'

/**
 * Trang danh sách các yêu cầu thuê phòng từ khách hàng
 * Cho phép chủ trọ tìm kiếm, lọc theo trạng thái và chuyển đến trang duyệt hoặc tạo hợp đồng
 */
export function Component() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RentalRequestStatus | 'all'>('all')

  const { data, isLoading } = useRentalRequests({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const requests = data?.data || []

  return (
    <div className="animate-in fade-in mx-auto max-w-[1200px] space-y-6 duration-300 pb-12">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Yêu cầu thuê phòng</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý, thẩm định hồ sơ và phê duyệt các đăng ký thuê trực tuyến từ khách hàng.
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Tìm theo tên khách hoặc mã phòng..."
            className="border-slate-200 bg-white pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RentalRequestStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-56 border-slate-200 bg-white">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
            <SelectItem value="NEED_MORE_INFO">Cần thông tin thêm</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
            <SelectItem value="CONVERTED_TO_CONTRACT">Đã chuyển hợp đồng</SelectItem>
            <SelectItem value="CANCELED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách yêu cầu thuê</CardTitle>
          <CardDescription>Tổng số: {requests.length} yêu cầu</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader className="border-b border-slate-100 bg-slate-50">
              <TableRow>
                <TableHead className="w-20 font-semibold text-slate-600 text-center">Mã</TableHead>
                <TableHead className="font-semibold text-slate-600">Khách hàng</TableHead>
                <TableHead className="font-semibold text-slate-600">Phòng quan tâm</TableHead>
                <TableHead className="font-semibold text-slate-600">Ngày vào ở dự kiến</TableHead>
                <TableHead className="w-36 text-center font-semibold text-slate-600">Trạng thái</TableHead>
                <TableHead className="w-28 text-right font-semibold text-slate-600">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
                      <p className="text-sm font-medium text-slate-500">Đang tải danh sách yêu cầu...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-10 w-10 text-slate-300" />
                      <p className="font-medium text-slate-600">Không có yêu cầu thuê nào</p>
                      <p className="text-sm text-slate-400">Các yêu cầu từ khách trên sàn sẽ xuất hiện tại đây.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req: RentalRequest) => (
                  <TableRow
                    key={req.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                    onClick={() => navigate(`/yeu-cau-thue/${req.id}`)}
                  >
                    <TableCell className="text-center font-medium text-slate-500 tabular-nums">
                      #{req.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {/* @ts-expect-error: backend field polymorphism */}
                            {req.renter?.fullName || `Khách thuê #${req.renterId}`}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                            Gửi ngày: {formatDate(req.createdAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-indigo-100 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        <Home className="h-3.5 w-3.5" />
                        {/* @ts-expect-error: optional room title */}
                        {req.room?.title ? req.room.title : `Phòng #${req.roomId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-700 tabular-nums">
                        <CalendarClock className="mr-2 h-4 w-4 text-slate-400" />
                        {req.expectedStartDate ? formatDate(req.expectedStartDate) : 'Chưa xác định'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        status={req.status}
                        statusMap={RENTAL_REQUEST_STATUS_MAP}
                        fallbackLabel={req.status}
                      />
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => navigate(`/yeu-cau-thue/${req.id}`)}
                      >
                        Xử lý <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
