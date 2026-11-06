import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, Search, MoreHorizontal, FileText, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { CONTRACT_STATUS_MAP } from '@/shared/constants/status-config'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContracts } from '@/shared/api/contracts'
import type { ContractStatus } from '@/types/contract'
import { formatCurrency, formatDate } from '@/shared/lib/utils'

/**
 * Trang danh sách các hợp đồng thuê trong tổ chức
 * Quản lý vòng đời hợp đồng: Bản nháp, Chờ ký, Đang hiệu lực, Đã thanh lý, Quá hạn
 */
export default function ContractListPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL')

  const { data: response, isLoading } = useContracts({
    search: searchTerm || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })

  const contracts = response?.data || []

  /**
   * Lọc hợp đồng bổ trợ client-side khi đang nhập tìm kiếm
   */
  const filteredContracts = contracts.filter((contract) => {
    const matchSearch = contract.contractCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || contract.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh sách hợp đồng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý vòng đời, tình trạng ký kết và giá trị hợp đồng thuê của khách thuê.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
            <Link to="/hop-dong/tao">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hợp đồng
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo mã hợp đồng (ví dụ: HD-001)..."
            className="pl-9 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={statusFilter}
            onValueChange={(val: ContractStatus | 'ALL') => setStatusFilter(val)}
          >
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
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

      {/* Table Card */}
      <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base font-semibold text-slate-800">Danh sách hợp đồng</CardTitle>
          <CardDescription>Tổng số: {filteredContracts.length} hợp đồng</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="font-semibold text-slate-600">Mã hợp đồng</TableHead>
                  <TableHead className="w-36 text-center font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-slate-600">Giá thuê/tháng</TableHead>
                  <TableHead className="font-semibold text-slate-600">Thời hạn thuê</TableHead>
                  <TableHead className="w-20 text-right font-semibold text-slate-600">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500 font-medium">
                      Đang tải danh sách hợp đồng...
                    </TableCell>
                  </TableRow>
                ) : filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-slate-500">
                      Không tìm thấy hợp đồng nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => navigate(`/hop-dong/${contract.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{contract.contractCode || `HD-${contract.id}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge
                          status={contract.status}
                          statusMap={CONTRACT_STATUS_MAP}
                          fallbackLabel={contract.status}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(contract.monthlyPrice)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 tabular-nums">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                          </span>
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
                            <DropdownMenuItem onClick={() => navigate(`/hop-dong/${contract.id}`)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            {contract.status === 'DRAFT' && (
                              <DropdownMenuItem onClick={() => navigate(`/hop-dong/${contract.id}/sua`)}>
                                Chỉnh sửa
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => navigate(`/hop-dong/${contract.id}/thanh-vien`)}>
                              Quản lý thành viên
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
        </CardContent>
      </Card>
    </div>
  )
}
