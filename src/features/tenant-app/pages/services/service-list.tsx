import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { useServices } from '@/shared/api/services'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { SERVICE_STATUS_MAP } from '@/shared/constants/status-config'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { formatCurrency } from '@/shared/lib/utils'
import {
  Plus,
  Search,
  Wrench,
  Wifi,
  Sparkles,
  Link2,
  CheckCircle2,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react'

/**
 * Trang danh mục dịch vụ tiện ích của chủ trọ.
 * Quản lý giá cước và phương thức tính phí dịch vụ (Wifi, Rác, Gửi xe, Thang máy...)
 */
export default function ServiceList() {
  const navigate = useNavigate()
  const { data, isLoading } = useServices()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

  const services = useMemo(() => data?.data || [], [data])

  // Thống kê nhanh dịch vụ
  const stats = useMemo(() => {
    const activeCount = services.filter((s) => s.isActive).length
    return {
      total: services.length,
      active: activeCount,
      inactive: services.length - activeCount,
    }
  }, [services])

  // Lọc dữ liệu client-side theo từ khóa và trạng thái
  const filteredServices = useMemo(() => {
    return services.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unitLabel?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive)

      return matchSearch && matchStatus
    })
  }, [services, searchTerm, statusFilter])

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh Mục Dịch Vụ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cấu hình bảng giá và phương thức tính cước cho các tiện ích bổ sung (Wifi, gửi xe, dọn vệ sinh...)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
            <Link to="/dich-vu-da-gan">
              <Link2 className="h-4 w-4 text-slate-600" /> Xem phòng đã gán
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dich-vu/tao-moi')}
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" /> Thêm dịch vụ
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Tổng số dịch vụ"
          value={stats.total}
          description="Dịch vụ cấu hình trong hệ thống"
          icon={<Wrench className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Đang áp dụng"
          value={stats.active}
          description="Sẵn sàng gán vào phòng thuê"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <MetricCard
          title="Tạm ngừng cung cấp"
          value={stats.inactive}
          description="Chưa áp dụng thu phí"
          icon={<SlidersHorizontal className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo tên dịch vụ, mã, đơn vị..."
            className="h-9 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className="h-8 text-xs"
          >
            Tất cả
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('ACTIVE')}
            className="h-8 text-xs"
          >
            Đang hoạt động
          </Button>
          <Button
            variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('INACTIVE')}
            className="h-8 text-xs"
          >
            Đã ngừng
          </Button>
        </div>
      </div>

      {/* Table Data Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[260px]">Tên dịch vụ</TableHead>
              <TableHead>Mã định danh</TableHead>
              <TableHead className="text-right">Đơn giá cơ sở</TableHead>
              <TableHead>Đơn vị tính</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={<Wrench className="h-7 w-7 text-slate-400" />}
                    title="Chưa có dịch vụ nào"
                    description={
                      searchTerm
                        ? "Không tìm thấy dịch vụ phù hợp với từ khóa tìm kiếm."
                        : "Bắt đầu tạo bảng giá dịch vụ bổ sung như Wifi, rác, gửi xe cho khu trọ của bạn."
                    }
                    action={
                      !searchTerm ? (
                        <Button
                          size="sm"
                          onClick={() => navigate('/dich-vu/tao-moi')}
                          className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                        >
                          <Plus className="h-4 w-4" /> Thêm dịch vụ đầu tiên
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                          Xóa tìm kiếm
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        {item.name.toLowerCase().includes('wifi') ? (
                          <Wifi className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-slate-50">
                      {item.code || `SRV-${item.id}`}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono text-right font-semibold tabular-nums text-slate-900">
                    {formatCurrency(item.defaultUnitPrice)}
                  </TableCell>

                  <TableCell className="text-slate-600">
                    / {item.unitLabel || 'tháng'}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge
                      status={item.isActive ? 'ACTIVE' : 'INACTIVE'}
                      statusMap={SERVICE_STATUS_MAP}
                      fallbackLabel={item.isActive ? 'Hoạt động' : 'Ngừng'}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="h-8 gap-1 text-xs">
                      <Link to={`/dich-vu/${item.id}/chinh-sua`}>
                        <Edit3 className="h-3 w-3" /> Sửa
                      </Link>
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
