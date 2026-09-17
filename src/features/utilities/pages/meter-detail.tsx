import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { METER_READING_STATUS_MAP, METER_STATUS_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useUtilityMetersControllerGetById, useMeterReadingsControllerList } from '../api'
import { RecordReadingDialog } from '../components/record-reading-dialog'
import { EditMeterDialog } from '../components/edit-meter-dialog'
import { formatCurrency } from '@/shared/lib/utils'
import { 
  Zap, 
  Droplet, 
  ArrowLeft, 
  Edit3, 
  Plus, 
  History, 
  DoorOpen, 
  Cpu, 
  Activity,
  Layers
} from 'lucide-react'

type MeterReading = {
  id: number
  billingMonth: string
  previousValue: number | null
  currentValue: number
  consumption: number
  unitPrice: number
  amount: number
  status: string
}

type MeterReadingsListResponse = {
  data: MeterReading[]
}

/**
 * Trang Chi tiết công tơ điện / nước dành cho chủ trọ.
 * Cung cấp thông tin cấu hình, thông số kỳ ghi mới nhất và bảng lịch sử đọc chỉ số.
 */
export function MeterDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: meterResponse, isLoading: isLoadingMeter } = useUtilityMetersControllerGetById(Number(id))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meter = meterResponse as Record<string, any>

  const { data: readingsResponse, isLoading: isLoadingReadings } = useMeterReadingsControllerList({
    meterId: Number(id),
    limit: 12,
  })

  const readings = (readingsResponse as MeterReadingsListResponse | undefined)?.data ?? []

  if (isLoadingMeter) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!meter) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <EmptyState
          icon={<Zap className="h-8 w-8 text-rose-500" />}
          title="Không tìm thấy công tơ"
          description="Công tơ này có thể đã bị xóa hoặc bạn không có quyền truy cập."
          action={
            <Button variant="outline" asChild>
              <Link to="/dien-nuoc/cong-to">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  const latestReading = readings[0] // Chỉ số kỳ mới nhất
  const isElectricity = meter.type === 'ELECTRICITY'
  const unitLabel = meter.unit || (isElectricity ? 'kWh' : 'm³')

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs">
            <Link to="/dien-nuoc/cong-to">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/dien-nuoc/cong-to" className="hover:text-blue-600">Công tơ</Link>
              <span>/</span>
              <span className="text-slate-900 font-medium">Chi tiết</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {meter.meterCode || meter.serialNumber}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <EditMeterDialog meter={meter}>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Edit3 className="h-3.5 w-3.5" /> Sửa thông tin
            </Button>
          </EditMeterDialog>
          <RecordReadingDialog meter={meter}>
            <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs">
              <Plus className="h-3.5 w-3.5" /> Ghi chỉ số
            </Button>
          </RecordReadingDialog>
        </div>
      </div>

      {/* Main Info Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
              isElectricity 
                ? 'border-amber-200 bg-amber-50 text-amber-600' 
                : 'border-blue-200 bg-blue-50 text-blue-600'
            }`}>
              {isElectricity ? <Zap className="h-7 w-7" /> : <Droplet className="h-7 w-7" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {meter.meterCode}
                </h2>
                <StatusBadge status={meter.status} statusMap={METER_STATUS_MAP} />
                <Badge variant="outline" className={isElectricity ? 'border-amber-200 bg-amber-50/60 text-amber-700' : 'border-blue-200 bg-blue-50/60 text-blue-700'}>
                  {isElectricity ? 'Điện năng' : 'Nước sinh hoạt'}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4 text-slate-400" />
                  <span>Phòng:</span>
                  <strong className="font-semibold text-slate-900">
                    {meter.room?.roomCode ? `Phòng ${meter.room.roomCode}` : 'Chưa gán phòng'}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <span>Đơn vị tính:</span>
                  <strong className="font-semibold text-slate-900">{unitLabel}</strong>
                </div>

                {meter.initialValue !== undefined && meter.initialValue !== null && (
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-slate-400" />
                    <span>Chỉ số khởi tạo:</span>
                    <strong className="font-mono tabular-nums text-slate-900">
                      {meter.initialValue} {unitLabel}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Widgets: Latest Reading + IoT Integration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest Reading Widget */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Activity className="h-4 w-4 text-blue-600" />
              Chỉ số kỳ gần nhất
            </h3>
            {latestReading && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Kỳ {new Date(latestReading.billingMonth).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
              </span>
            )}
          </div>

          {latestReading ? (
            <div className="flex flex-1 flex-col justify-between py-4">
              <div className="text-center">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Lượng tiêu thụ
                </span>
                <div className="font-mono text-4xl font-bold tracking-tight text-blue-600 tabular-nums">
                  {latestReading.consumption?.toLocaleString('vi-VN')}
                  <span className="ml-1 text-base font-medium text-slate-400">{unitLabel}</span>
                </div>
              </div>

              <div className="my-4 grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                <div>
                  <span className="text-xs text-slate-400">Chỉ số cũ</span>
                  <p className="font-mono text-sm font-semibold tabular-nums text-slate-700">
                    {latestReading.previousValue?.toLocaleString('vi-VN') || 0}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Chỉ số mới</span>
                  <p className="font-mono text-sm font-semibold tabular-nums text-slate-900">
                    {latestReading.currentValue?.toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 p-2.5 text-center">
                  <span className="text-xs text-slate-500">Tạm tính</span>
                  <p className="font-mono text-sm font-bold tabular-nums text-slate-900">
                    {formatCurrency(latestReading.amount)}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 p-2.5 text-center">
                  <span className="mb-1 text-xs text-slate-500">Trạng thái</span>
                  <StatusBadge 
                    status={latestReading.status} 
                    statusMap={METER_READING_STATUS_MAP} 
                    fallbackLabel={latestReading.status} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">Chưa có dữ liệu kỳ ghi nào</p>
              <RecordReadingDialog meter={meter}>
                <Button variant="outline" size="sm" className="mt-3 text-xs">
                  Ghi chỉ số đầu tiên
                </Button>
              </RecordReadingDialog>
            </div>
          )}
        </div>

        {/* IoT / Automated Sync Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Cpu className="h-4 w-4 text-emerald-600" />
              Tự động hóa & IoT Smart Meter
            </h3>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs">
              Thủ công (Chưa kích hoạt IoT)
            </Badge>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs border border-slate-200 text-slate-400">
              <Cpu className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-sm font-semibold text-slate-900">
              Kết nối đồng hồ thông minh (IoT)
            </h4>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Hệ thống hỗ trợ tích hợp dữ liệu tự động từ các bộ đo thông minh Tuya, Sonoff, Vconnex hoặc camera ghi chỉ số tự động để không cần ghi tay hàng tháng.
            </p>
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              Cấu hình Gateway IoT
            </Button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <History className="h-4 w-4 text-slate-600" />
              Lịch sử ghi chỉ số theo kỳ
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi biến động tiêu thụ qua các tháng thanh toán
            </p>
          </div>
          <RecordReadingDialog meter={meter}>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Ghi số tháng mới
            </Button>
          </RecordReadingDialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Kỳ tính phí</TableHead>
                <TableHead className="text-right">Chỉ số cũ</TableHead>
                <TableHead className="text-right">Chỉ số mới</TableHead>
                <TableHead className="text-right">Tiêu thụ ({unitLabel})</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingReadings ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-5 w-24" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="mx-auto h-6 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={<History className="h-7 w-7 text-slate-400" />}
                      title="Chưa có dữ liệu lịch sử"
                      description="Chưa có bản ghi chỉ số nào cho công tơ này. Nhấn 'Ghi số tháng mới' để tạo kỳ chốt đầu tiên."
                      action={
                        <RecordReadingDialog meter={meter}>
                          <Button size="sm" className="text-xs">Ghi chỉ số ngay</Button>
                        </RecordReadingDialog>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id} className="transition-colors hover:bg-slate-50/80">
                    <TableCell className="font-medium text-slate-900">
                      Tháng {new Date(reading.billingMonth).toLocaleDateString('vi-VN', {
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="font-mono text-right tabular-nums text-slate-500">
                      {reading.previousValue?.toLocaleString('vi-VN') ?? '—'}
                    </TableCell>
                    <TableCell className="font-mono text-right font-semibold tabular-nums text-slate-900">
                      {reading.currentValue?.toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-mono text-right font-semibold tabular-nums text-blue-600">
                      {reading.consumption?.toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell className="font-mono text-right tabular-nums text-slate-500">
                      {formatCurrency(reading.unitPrice)}
                    </TableCell>
                    <TableCell className="font-mono text-right font-bold tabular-nums text-slate-900">
                      {formatCurrency(reading.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        status={reading.status}
                        statusMap={METER_READING_STATUS_MAP}
                        fallbackLabel={reading.status}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
