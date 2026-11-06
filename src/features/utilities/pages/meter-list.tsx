import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useUtilityMetersControllerList } from '@/shared/api/generated/utility-meters/utility-meters'
import { useProperties } from '@/shared/api/properties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { METER_STATUS_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { CreateMeterDialog } from '../components/create-meter-dialog'
import { 
  Zap, 
  Droplet, 
  Search, 
  Gauge, 
  DoorOpen, 
  MoreVertical, 
  Eye, 
  History, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

/**
 * Trang danh sách công tơ điện nước trong hệ thống dành cho chủ trọ/quản lý.
 * Hỗ trợ hiển thị KPI tổng quan, bộ lọc theo khu trọ, loại tiện ích và phân trang.
 */
export function MeterListPage() {
  const [filters, setFilters] = useState<{
    page: number
    limit: number
    type?: 'ELECTRICITY' | 'WATER'
    search?: string
    propertyId?: string
  }>({
    page: 1,
    limit: 10,
    propertyId: 'ALL',
  })

  // Lấy danh sách khu trọ để phục vụ bộ lọc
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  // Fetch danh sách công tơ từ API
  const { data: response, isLoading } = useUtilityMetersControllerList(
    {
      page: filters.page,
      limit: filters.limit,
      type: filters.type,
      search: filters.search,
    } as unknown as Parameters<typeof useUtilityMetersControllerList>[0],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meters = useMemo(() => (response as unknown as { data?: Array<any> })?.data || [], [response])
  const total = (response as unknown as { meta?: { total?: number } })?.meta?.total || 0

  // Tính toán nhanh số liệu KPI từ dữ liệu hiện tại
  const stats = useMemo(() => {
    const electricityCount = meters.filter((m) => m.type === 'ELECTRICITY').length
    const waterCount = meters.filter((m) => m.type === 'WATER').length
    const unassignedCount = meters.filter((m) => !m.roomId).length
    return {
      total: total || meters.length,
      electricity: electricityCount,
      water: waterCount,
      unassigned: unassignedCount,
    }
  }, [meters, total])

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Công tơ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi, phân bổ và quản lý toàn bộ đồng hồ đo điện, nước trong các khu trọ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateMeterDialog />
        </div>
      </div>

      {/* Metric Cards KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng số công tơ"
          value={stats.total}
          description="Đồng hồ đo toàn hệ thống"
          icon={<Gauge className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Công tơ điện"
          value={stats.electricity}
          description="Đang cấp điện sinh hoạt"
          icon={<Zap className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          title="Công tơ nước"
          value={stats.water}
          description="Đo lưu lượng nước tiêu thụ"
          icon={<Droplet className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Chưa gắn phòng"
          value={stats.unassigned}
          description={stats.unassigned > 0 ? "Cần phân bổ vào phòng" : "Tất cả đã được gán phòng"}
          icon={<DoorOpen className="h-5 w-5" />}
          tone={stats.unassigned > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Filters Bar */}
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:grid-cols-12">
        {/* Tìm kiếm */}
        <div className="relative sm:col-span-6 lg:col-span-5">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo mã công tơ hoặc serial..."
            className="h-9 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Lọc theo Khu trọ */}
        <div className="sm:col-span-3 lg:col-span-4">
          <Select
            value={filters.propertyId || 'ALL'}
            onValueChange={(val) => handleFilterChange('propertyId', val)}
          >
            <SelectTrigger className="h-9 bg-slate-50 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="Tất cả khu trọ" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả khu trọ</SelectItem>
              {properties.map((p: Property) => (
                <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lọc theo Loại công tơ */}
        <div className="sm:col-span-3 lg:col-span-3">
          <Select
            value={filters.type || 'ALL'}
            onValueChange={(val) => handleFilterChange('type', val === 'ALL' ? undefined : val)}
          >
            <SelectTrigger className="h-9 bg-slate-50 text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <SelectValue placeholder="Tất cả loại" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">Tất cả loại</SelectItem>
              <SelectItem value="ELECTRICITY" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Công tơ điện
                </span>
              </SelectItem>
              <SelectItem value="WATER" className="text-xs">
                <span className="flex items-center gap-1.5">
                  <Droplet className="h-3.5 w-3.5 text-blue-500" /> Công tơ nước
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table List Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[220px]">Mã công tơ</TableHead>
              <TableHead>Loại tiện ích</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phòng đang gắn</TableHead>
              <TableHead className="text-right">Chỉ số hiện tại</TableHead>
              <TableHead className="w-[80px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading State
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : meters.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={<Gauge className="h-7 w-7 text-slate-400" />}
                    title="Chưa tìm thấy công tơ nào"
                    description={
                      filters.search || filters.type
                        ? "Không tìm thấy công tơ phù hợp với điều kiện lọc hiện tại. Vui lòng thử tìm kiếm khác."
                        : "Hệ thống chưa có công tơ nào được ghi nhận. Bắt đầu bằng việc thêm công tơ mới cho khu trọ."
                    }
                    action={
                      !filters.search && !filters.type ? (
                        <CreateMeterDialog />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFilters({ page: 1, limit: 10, propertyId: 'ALL' })}
                        >
                          Xóa bộ lọc
                        </Button>
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              meters.map((meter) => (
                <TableRow key={meter.id} className="transition-colors hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                        <Link to={`/dien-nuoc/cong-to/${meter.id}`}>{meter.meterCode}</Link>
                      </span>
                      <span className="text-xs text-slate-500">
                        {meter.createdAt
                          ? `Thêm ngày ${new Date(meter.createdAt).toLocaleDateString('vi-VN')}`
                          : 'Đang hoạt động'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {meter.type === 'ELECTRICITY' ? (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 font-normal text-amber-700">
                        <Zap className="mr-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Điện (kWh)
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 font-normal text-blue-700">
                        <Droplet className="mr-1 h-3.5 w-3.5 fill-blue-500 text-blue-500" /> Nước (m³)
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={meter.status} statusMap={METER_STATUS_MAP} />
                  </TableCell>
                  <TableCell>
                    {meter.roomId ? (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <DoorOpen className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">Phòng {meter.room?.roomCode || meter.roomId}</span>
                      </div>
                    ) : (
                      <span className="italic text-slate-400">Chưa gắn phòng</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                      {meter.readings?.[0]?.currentValue?.toLocaleString('vi-VN') ?? 0}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">
                      {meter.type === 'ELECTRICITY' ? 'kWh' : 'm³'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Thao tác</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem asChild>
                          <Link to={`/dien-nuoc/cong-to/${meter.id}`} className="flex cursor-pointer items-center">
                            <Eye className="mr-2 h-4 w-4 text-slate-500" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dien-nuoc/chi-so?roomId=${meter.roomId || ''}`}
                            className="flex cursor-pointer items-center"
                          >
                            <History className="mr-2 h-4 w-4 text-slate-500" />
                            Lịch sử ghi số
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Section */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500">
            <div>
              Hiển thị <span className="font-medium text-slate-700">{(filters.page - 1) * filters.limit + 1}</span> -{' '}
              <span className="font-medium text-slate-700">{Math.min(filters.page * filters.limit, total)}</span> trên tổng số{' '}
              <span className="font-medium text-slate-700">{total}</span> công tơ
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1 text-xs"
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
                {filters.page}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 gap-1 text-xs"
                disabled={filters.page * filters.limit >= total}
                onClick={() => handleFilterChange('page', filters.page + 1)}
              >
                Sau <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
