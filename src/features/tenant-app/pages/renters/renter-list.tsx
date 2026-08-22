import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MoreHorizontal, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRenters } from '@/shared/api/renters'
import type { RenterVerificationStatus } from '@/types/renter'

const getStatusBadge = (status: RenterVerificationStatus) => {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge className="border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Đã xác minh
        </Badge>
      )
    case 'PENDING':
      return (
        <Badge className="border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
          <Clock className="mr-1 h-3.5 w-3.5" /> Chờ xác minh
        </Badge>
      )
    case 'REJECTED':
      return (
        <Badge className="border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
          <XCircle className="mr-1 h-3.5 w-3.5" /> Bị từ chối
        </Badge>
      )
    case 'UNVERIFIED':
      return (
        <Badge className="border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
          <AlertCircle className="mr-1 h-3.5 w-3.5" /> Chưa xác minh
        </Badge>
      )
    default:
      return (
        <Badge className="border-none bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          {status}
        </Badge>
      )
  }
}

export default function RenterListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RenterVerificationStatus | 'ALL'>('ALL')

  const { data: response, isLoading } = useRenters({
    search: searchTerm || undefined,
    verificationStatus: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const renters = response?.data || []

  // Keep the visible rows synchronized immediately while the debounced server query refreshes.
  const filteredRenters = renters.filter((renter) => {
    const matchSearch =
      renter.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      renter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (renter.phone && renter.phone.includes(searchTerm))
    const matchStatus = statusFilter === 'ALL' || renter.verificationStatus === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Danh sách người thuê</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý thông tin và hồ sơ của người thuê trong hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link to="/nguoi-thue/loi-moi/tao">
              <Plus className="mr-2 h-4 w-4" />
              Gửi lời mời
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, email, sđt..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={(val: RenterVerificationStatus | 'ALL') => setStatusFilter(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="VERIFIED">Đã xác minh</SelectItem>
              <SelectItem value="PENDING">Chờ xác minh</SelectItem>
              <SelectItem value="UNVERIFIED">Chưa xác minh</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Họ tên</TableHead>
              <TableHead>Email & SĐT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredRenters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Không tìm thấy người thuê nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredRenters.map((renter) => (
                <TableRow key={renter.id} className="transition-colors hover:bg-slate-50/50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{renter.fullName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-700">{renter.email}</span>
                      {renter.phone && <span className="text-sm text-slate-500">{renter.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(renter.verificationStatus)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {new Date(renter.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
