import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Search, MoreHorizontal, FileText } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContracts } from '@/shared/api/contracts'

const getStatusBadge = (status: ContractStatus) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-100 text-green-700">Đang hiệu lực</Badge>
    case 'DRAFT':
      return <Badge className="bg-slate-100 text-slate-700">Bản nháp</Badge>
    case 'WAITING_LANDLORD_SIGN':
    case 'WAITING_RENTER_SIGN':
      return <Badge className="bg-blue-100 text-blue-700">Chờ ký</Badge>
    case 'EXPIRED':
      return <Badge className="bg-yellow-100 text-yellow-700">Đã hết hạn</Badge>
    case 'TERMINATED':
      return <Badge className="bg-slate-800 text-slate-100">Đã thanh lý</Badge>
    case 'CANCELED':
      return <Badge className="bg-red-100 text-red-700">Đã hủy</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function ContractListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL')

  const { data: response, isLoading } = useContracts({
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const contracts = response?.data || []

  const filteredContracts = contracts.filter((contract) => {
    const matchSearch = contract.contractCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || contract.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Danh sách hợp đồng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý hợp đồng thuê phòng của khách thuê.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link to="/app/hop-dong/tao">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hợp đồng
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo mã hợp đồng..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select
            value={statusFilter}
            onValueChange={(val: ContractStatus | 'ALL') => setStatusFilter(val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="WAITING_LANDLORD_SIGN">Chờ chủ trọ ký</SelectItem>
              <SelectItem value="WAITING_RENTER_SIGN">Chờ khách ký</SelectItem>
              <SelectItem value="EXPIRED">Hết hạn</SelectItem>
              <SelectItem value="TERMINATED">Đã thanh lý</SelectItem>
              <SelectItem value="CANCELED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead>Mã hợp đồng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Giá thuê/tháng</TableHead>
              <TableHead>Thời hạn</TableHead>
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
            ) : filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Không tìm thấy hợp đồng nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{contract.contractCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.monthlyPrice)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                      <span>Từ: {new Date(contract.startDate).toLocaleDateString('vi-VN')}</span>
                      <span>Đến: {new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
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
                        <DropdownMenuItem onClick={() => navigate(`/app/hop-dong/${contract.id}`)}>
                          Xem chi tiết
                        </DropdownMenuItem>
                        {contract.status === 'DRAFT' && (
                          <DropdownMenuItem onClick={() => navigate(`/app/hop-dong/${contract.id}/sua`)}>
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/app/hop-dong/${contract.id}/thanh-vien`)}>
                          Thành viên
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
