import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { VERIFICATION_STATUS_MAP } from '@/shared/constants/status-config'
import { Plus, Search, MoreHorizontal, User, Mail, Phone, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRenters } from '@/shared/api/renters'
import type { RenterVerificationStatus } from '@/types/renter'
import { formatDate } from '@/shared/lib/utils'

/**
 * Trang danh sách người thuê phòng trong khu trọ/tổ chức
 * Hiển thị danh sách khách thuê, trạng thái xác thực CCCD và các thao tác liên quan
 */
export default function RenterListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RenterVerificationStatus | 'ALL'>('ALL')

  const { data: response, isLoading } = useRenters({
    search: searchTerm || undefined,
    verificationStatus: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const renters = response?.data || []

  /**
   * Lọc danh sách người thuê client-side bổ trợ trong khi query debounce cập nhật
   */
  const filteredRenters = renters.filter((renter) => {
    const matchSearch =
      renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Boolean(renter.phone && renter.phone.includes(searchTerm))
    const currentStatus = renter.renterProfile?.verificationStatus || renter.verificationStatus
    const matchStatus = statusFilter === 'ALL' || currentStatus === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách người thuê</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý thông tin, hồ sơ và lời mời người thuê vào hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
            <Link to="/nguoi-thue/loi-moi/tao">
              <Plus className="mr-2 h-4 w-4" />
              Gửi lời mời
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="border-slate-200 bg-white pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={(val: RenterVerificationStatus | 'ALL') => setStatusFilter(val)}>
            <SelectTrigger className="border-slate-200 bg-white">
              <SelectValue placeholder="Trạng thái xác minh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="VERIFIED">Đã xác minh</SelectItem>
              <SelectItem value="PENDING">Chờ xác minh</SelectItem>
              <SelectItem value="UNVERIFIED">Chưa xác minh</SelectItem>
              <SelectItem value="REJECTED">Bị từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách khách thuê</CardTitle>
          <CardDescription>Tổng số: {filteredRenters.length} người thuê</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-slate-100 bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Khách thuê</TableHead>
                  <TableHead className="font-semibold text-slate-600">Liên hệ</TableHead>
                  <TableHead className="w-36 text-center font-semibold text-slate-600">Trạng thái CCCD</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày tham gia</TableHead>
                  <TableHead className="w-24 text-right font-semibold text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-medium">
                      Đang tải dữ liệu người thuê...
                    </TableCell>
                  </TableRow>
                ) : filteredRenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                      Không tìm thấy người thuê nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRenters.map((renter) => {
                    const currentStatus =
                      renter.renterProfile?.verificationStatus || renter.verificationStatus || 'UNVERIFIED'
                    return (
                      <TableRow
                        key={renter.id}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => navigate(`/nguoi-thue/${renter.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                              <User className="h-4 w-4" />
                            </div>
                            <div className="font-semibold text-slate-900">{renter.fullName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-sm">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {renter.email}
                            </span>
                            {renter.phone && (
                              <span className="flex items-center gap-1.5 text-slate-500 tabular-nums text-xs">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {renter.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge
                            status={currentStatus}
                            statusMap={VERIFICATION_STATUS_MAP}
                            fallbackLabel={currentStatus}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 tabular-nums">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(renter.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/nguoi-thue/${renter.id}`)}>
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/hop-dong/tao?renterId=${renter.id}`)}>
                                Tạo hợp đồng
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
