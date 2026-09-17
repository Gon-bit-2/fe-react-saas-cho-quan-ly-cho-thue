import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { METER_READING_STATUS_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { useMeterReadingsControllerList, meterReadingsControllerUpdateStatus } from '../api'
import { CreateMeterDialog } from '../components/create-meter-dialog'
import { useRoomsControllerList } from '@/shared/api/generated/rooms/rooms'
import { useProperties } from '@/shared/api/properties'
import { formatCurrency } from '@/shared/lib/utils'
import {
  Zap,
  Droplet,
  Plus,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  DoorOpen,
  Eye,
  MoreVertical,
  Check,
  Layers,
} from 'lucide-react'
import type { Property } from '@/features/tenant-app/types'

/**
 * Trang quản lý và theo dõi chỉ số điện nước định kỳ cho từng phòng.
 * Hỗ trợ bộ lọc kỳ tính tiền, duyệt chỉ số hàng loạt, theo dõi KPI tiêu thụ.
 */
export function MeterReadingsListPage() {
  const queryClient = useQueryClient()

  // Kỳ tính tiền mặc định là tháng hiện tại dạng YYYY-MM-01
  const currentDate = new Date()
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`

  const [filters, setFilters] = useState<{
    page: number
    limit: number
    propertyId?: string
    roomId?: number
    billingMonth?: string
    type?: 'ELECTRICITY' | 'WATER'
    status?: 'DRAFT' | 'CONFIRMED' | 'ABNORMAL' | 'REJECTED'
  }>({
    page: 1,
    limit: 10,
    propertyId: 'ALL',
    billingMonth: currentMonthStr,
  })

  // Lấy danh sách khu trọ
  const { data: propertiesData } = useProperties()
  const properties = propertiesData?.data || []

  // Lấy danh sách phòng
  const { data: roomsResponse, isLoading: isLoadingRooms } = useRoomsControllerList({ limit: 100 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRooms = useMemo(() => (roomsResponse as unknown as { data?: Array<any> })?.data || [], [roomsResponse])

  const filteredRooms = useMemo(() => {
    if (filters.propertyId === 'ALL' || !filters.propertyId) return allRooms
    return allRooms.filter((r) => r.propertyId?.toString() === filters.propertyId)
  }, [allRooms, filters.propertyId])

  // Lấy danh sách chỉ số theo filters
  const { data: response, isLoading } = useMeterReadingsControllerList({
    page: filters.page,
    limit: filters.limit,
    roomId: filters.roomId,
    billingMonth: filters.billingMonth,
    type: filters.type,
    status: filters.status,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readings = useMemo(() => (response as unknown as { data?: Array<any> })?.data || [], [response])
  const total = (response as unknown as { meta?: { total?: number } })?.meta?.total || 0

  // Mutation duyệt trạng thái chỉ số
  const { mutate: updateReadingStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: 'CONFIRMED' | 'ABNORMAL' | 'REJECTED' } }) =>
      meterReadingsControllerUpdateStatus(id, data),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái chỉ số thành công')
      queryClient.invalidateQueries({ queryKey: ['meter-readings'] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
    },
  })

  // Tính toán KPI tổng hợp tiêu thụ & thành tiền
  const stats = useMemo(() => {
    let electricityUsage = 0
    let waterUsage = 0
    let totalEstimatedAmount = 0
    let confirmedCount = 0

    readings.forEach((r) => {
      const consumption = Number(r.consumption) || 0
      const amount = Number(r.amount) || 0
      if (r.meter?.type === 'ELECTRICITY') {
        electricityUsage += consumption
      } else if (r.meter?.type === 'WATER') {
        waterUsage += consumption
      }
      totalEstimatedAmount += amount
      if (r.status === 'CONFIRMED') {
        confirmedCount++
      }
    })

    return {
      electricityUsage,
      waterUsage,
      totalEstimatedAmount,
      confirmedCount,
      totalCount: readings.length,
    }
  }, [readings])

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  // Điều hướng tháng lùi / tiến
  const handleShiftMonth = (direction: 'prev' | 'next') => {
    const currentBillingMonth = filters.billingMonth ? new Date(filters.billingMonth) : new Date()
    const newMonth = new Date(currentBillingMonth)
    newMonth.setMonth(currentBillingMonth.getMonth() + (direction === 'prev' ? -1 : 1))
    const formatted = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, '0')}-01`
    handleFilterChange('billingMonth', formatted)
  }

  const selectedMonthDisplay = filters.billingMonth
    ? new Date(filters.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
    : 'Tất cả các tháng'

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chỉ số Điện Nước</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý, ghi nhận và đối soát số liệu điện nước định kỳ trước khi phát hành hóa đơn
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <CreateMeterDialog>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Thêm công tơ
            </Button>
          </CreateMeterDialog>

          <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
            <Link to="/dien-nuoc/ocr-review">
              <Camera className="h-4 w-4 text-slate-600" /> Duyệt OCR ảnh
            </Link>
          </Button>

          <Button size="sm" asChild className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs">
            <Link to="/dien-nuoc/cong-to/ghi-chi-so">
              <Layers className="h-4 w-4" /> Ghi chỉ số hàng loạt
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Điện tiêu thụ kỳ này"
          value={
            <span>
              {stats.electricityUsage.toLocaleString('vi-VN')}{' '}
              <span className="text-sm font-normal text-slate-400">kWh</span>
            </span>
          }
          description="Sản lượng toàn khu trọ"
          icon={<Zap className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          title="Nước tiêu thụ kỳ này"
          value={
            <span>
              {stats.waterUsage.toLocaleString('vi-VN')}{' '}
              <span className="text-sm font-normal text-slate-400">m³</span>
            </span>
          }
          description="Tổng khối nước ghi nhận"
          icon={<Droplet className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Tiền điện nước tạm tính"
          value={formatCurrency(stats.totalEstimatedAmount)}
          description="Chờ chuyển vào hóa đơn"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <MetricCard
          title="Tiến độ chốt số"
          value={`${stats.confirmedCount} / ${stats.totalCount || 0}`}
          description={
            stats.totalCount > 0 && stats.confirmedCount === stats.totalCount
              ? 'Đã duyệt toàn bộ'
              : 'Còn bản ghi chờ duyệt'
          }
          icon={<Check className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      {/* Month Navigator & Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Bộ chuyển tháng */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:bg-white"
              onClick={() => handleShiftMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex min-w-[130px] items-center justify-center gap-1.5 font-semibold text-xs text-slate-900">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Tháng {selectedMonthDisplay}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:bg-white"
              onClick={() => handleShiftMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters Fields */}
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4 lg:max-w-3xl">
            {/* Lọc Khu trọ */}
            <Select
              value={filters.propertyId || 'ALL'}
              onValueChange={(val) => handleFilterChange('propertyId', val)}
            >
              <SelectTrigger className="h-8 bg-slate-50 text-xs">
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

            {/* Lọc Phòng */}
            <Select
              value={filters.roomId ? filters.roomId.toString() : 'ALL'}
              onValueChange={(val) => handleFilterChange('roomId', val === 'ALL' ? undefined : Number(val))}
            >
              <SelectTrigger className="h-8 bg-slate-50 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <DoorOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <SelectValue placeholder={isLoadingRooms ? 'Đang tải...' : 'Tất cả phòng'} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả phòng</SelectItem>
                {filteredRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()} className="text-xs">
                    Phòng {room.roomCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Lọc Loại tiện ích */}
            <Select
              value={filters.type || 'ALL'}
              onValueChange={(val) => handleFilterChange('type', val === 'ALL' ? undefined : val)}
            >
              <SelectTrigger className="h-8 bg-slate-50 text-xs">
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả loại</SelectItem>
                <SelectItem value="ELECTRICITY" className="text-xs">Điện (kWh)</SelectItem>
                <SelectItem value="WATER" className="text-xs">Nước (m³)</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc Trạng thái */}
            <Select
              value={filters.status || 'ALL'}
              onValueChange={(val) => handleFilterChange('status', val === 'ALL' ? undefined : val)}
            >
              <SelectTrigger className="h-8 bg-slate-50 text-xs">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT" className="text-xs">Chờ duyệt</SelectItem>
                <SelectItem value="CONFIRMED" className="text-xs">Đã duyệt</SelectItem>
                <SelectItem value="ABNORMAL" className="text-xs">Bất thường</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead>Kỳ chốt</TableHead>
                <TableHead>Phòng & Công tơ</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Chỉ số cũ</TableHead>
                <TableHead className="text-right">Chỉ số mới</TableHead>
                <TableHead className="text-right">Tiêu thụ</TableHead>
                <TableHead className="text-right">Tạm tính</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-0">
                    <EmptyState
                      icon={<Calendar className="h-7 w-7 text-slate-400" />}
                      title="Chưa có dữ liệu chỉ số kỳ này"
                      description="Chưa có bản ghi chỉ số điện nước nào trong tháng đã chọn. Bấm 'Ghi chỉ số hàng loạt' để bắt đầu nhập."
                      action={
                        <Button size="sm" asChild className="text-xs">
                          <Link to="/dien-nuoc/cong-to/ghi-chi-so">Ghi chỉ số ngay</Link>
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => {
                  const isElectricity = reading.meter?.type === 'ELECTRICITY'
                  const unit = reading.meter?.unit || (isElectricity ? 'kWh' : 'm³')
                  return (
                    <TableRow key={reading.id} className="transition-colors hover:bg-slate-50/80">
                      <TableCell className="font-medium text-slate-900">
                        {new Date(reading.billingMonth).toLocaleDateString('vi-VN', {
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <DoorOpen className="h-4 w-4 text-slate-400" />
                          <span>Phòng {reading.room?.roomCode}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          CT:{' '}
                          <Link
                            to={`/dien-nuoc/cong-to/${reading.meterId}`}
                            className="font-mono text-blue-600 hover:underline"
                          >
                            {reading.meter?.meterCode}
                          </Link>
                        </div>
                      </TableCell>

                      <TableCell>
                        {isElectricity ? (
                          <Badge variant="outline" className="border-amber-200 bg-amber-50 font-normal text-amber-700">
                            <Zap className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" /> Điện
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-normal text-blue-700">
                            <Droplet className="mr-1 h-3 w-3 fill-blue-500 text-blue-500" /> Nước
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-right tabular-nums text-slate-500">
                        {reading.previousValue?.toLocaleString('vi-VN') ?? 0}
                      </TableCell>

                      <TableCell className="font-mono text-right font-semibold tabular-nums text-slate-900">
                        {reading.currentValue?.toLocaleString('vi-VN')}
                      </TableCell>

                      <TableCell className="font-mono text-right font-bold tabular-nums text-blue-600">
                        {reading.consumption?.toLocaleString('vi-VN')} {unit}
                      </TableCell>

                      <TableCell className="font-mono text-right font-semibold tabular-nums text-slate-900">
                        {formatCurrency(reading.amount)}
                      </TableCell>

                      <TableCell className="text-center">
                        <StatusBadge
                          status={reading.status}
                          statusMap={METER_READING_STATUS_MAP}
                          fallbackLabel={reading.status}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuItem asChild>
                              <Link to={`/dien-nuoc/cong-to/${reading.meterId}`}>
                                <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                Xem công tơ
                              </Link>
                            </DropdownMenuItem>
                            {reading.status === 'DRAFT' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  updateReadingStatus({
                                    id: reading.id,
                                    data: { status: 'CONFIRMED' },
                                  })
                                }}
                                disabled={isUpdatingStatus}
                                className="text-emerald-600 font-medium"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Duyệt chỉ số
                              </DropdownMenuItem>
                            )}
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

        {/* Pagination Section */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500">
            <div>
              Hiển thị <span className="font-medium text-slate-700">{(filters.page - 1) * filters.limit + 1}</span> -{' '}
              <span className="font-medium text-slate-700">{Math.min(filters.page * filters.limit, total)}</span> trên tổng số{' '}
              <span className="font-medium text-slate-700">{total}</span> chỉ số
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
