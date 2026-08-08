import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRenters } from '@/shared/api/renters'

const getStatusBadge = (status: RenterVerificationStatus) => {
  switch (status) {
    case 'VERIFIED':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Đã xác minh</Badge>
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Chờ xác minh</Badge>
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Từ chối</Badge>
    case 'UNVERIFIED':
    default:
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Chưa xác minh</Badge>
  }
}

export default function RenterListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<RenterVerificationStatus | 'ALL'>('ALL')
  
  const { data: response, isLoading } = useRenters({
    search: searchTerm || undefined,
    verificationStatus: statusFilter === 'ALL' ? undefined : statusFilter
  })

  // Đảm bảo có fallback rỗng nếu data chưa load xong
  const renters = response?.data || []

  // Lưu ý: Tính năng tìm kiếm đã được truyền lên hook useRenters, nên ta có thể lọc trên client 
  // nếu API chưa triển khai hoàn thiện search (như fallback mock data).
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Danh sách người thuê</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý thông tin và hồ sơ của người thuê trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link to="/app/nguoi-thue/loi-moi/tao">
              <Plus className="h-4 w-4 mr-2" />
              Gửi lời mời
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, email, sđt..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(val: RenterVerificationStatus | 'ALL') => setStatusFilter(val)}
          >
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
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
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
                <TableRow key={renter.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-slate-900">{renter.fullName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-slate-700">{renter.email}</span>
                      {renter.phone && (
                        <span className="text-sm text-slate-500">{renter.phone}</span>
                      )}
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
                        <DropdownMenuItem onClick={() => navigate(`/app/nguoi-thue/${renter.id}`)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/app/hop-dong/tao?renterId=${renter.id}`)}>
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
