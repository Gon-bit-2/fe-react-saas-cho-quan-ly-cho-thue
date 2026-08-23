import { useParams, Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { METER_READING_STATUS_MAP, METER_STATUS_MAP } from '@/shared/constants/status-config'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUtilityMetersControllerGetById, useMeterReadingsControllerList } from '../api'
import { RecordReadingDialog } from '../components/record-reading-dialog'
import { EditMeterDialog } from '../components/edit-meter-dialog'

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

export function MeterDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: meterResponse, isLoading: isLoadingMeter } = useUtilityMetersControllerGetById(Number(id))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meter = meterResponse as Record<string, any>

  const { data: readingsResponse, isLoading: isLoadingReadings } = useMeterReadingsControllerList({
    meterId: Number(id),
    limit: 12,
  })

  // The generated OpenAPI model currently exposes response properties as
  // `unknown`, so narrow the endpoint payload once at the API boundary.
  const readings = (readingsResponse as MeterReadingsListResponse | undefined)?.data ?? []

  const getReadingStatusBadge = (status: string) => {
    return <StatusBadge status={status} statusMap={METER_READING_STATUS_MAP} fallbackLabel={status} />
  }

  if (isLoadingMeter) {
    return <div className="p-8">Đang tải thông tin công tơ...</div>
  }

  if (!meter) {
    return <div className="p-8 text-red-500">Không tìm thấy công tơ</div>
  }

  const latestReading = readings[0] // Assuming API returns sorted by date DESC

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] w-full flex-col bg-slate-50 p-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/dien-nuoc/cong-to" className="hover:text-primary transition-colors">
          Danh sách Công tơ
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-medium text-slate-900">Chi tiết công tơ</span>
      </div>

      {/* Header Info */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex gap-6">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined text-[32px]">
              {meter.type === 'ELECTRICITY' ? 'bolt' : 'water_drop'}
            </span>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{meter.serialNumber}</h1>
              <StatusBadge status={meter.status} statusMap={METER_STATUS_MAP} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">category</span>
                Loại: <strong className="text-slate-900">{meter.type === 'ELECTRICITY' ? 'Điện' : 'Nước'}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">apartment</span>
                Phòng: <strong className="text-slate-900">{meter.room?.roomCode}</strong>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">calculate</span>
                Đơn vị tính:{' '}
                <strong className="text-slate-900">
                  {meter.unit || (meter.type === 'ELECTRICITY' ? 'kWh' : 'm³')}
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <EditMeterDialog meter={meter}>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Sửa thông tin
            </Button>
          </EditMeterDialog>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Latest Reading Widget */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="material-symbols-outlined text-primary">data_usage</span>
              Chỉ số kỳ gần nhất
            </h3>
            {latestReading && (
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                Kỳ{' '}
                {new Date(latestReading.billingMonth).toLocaleDateString('vi-VN', {
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>

          {latestReading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-4">
              <div className="text-primary mb-2 text-5xl font-bold">
                {latestReading.consumption?.toLocaleString()}{' '}
                <span className="text-2xl font-medium text-slate-400">{meter.unit}</span>
              </div>
              <div className="mb-6 flex gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300"></span> Cũ:{' '}
                  {latestReading.previousValue?.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <span className="bg-primary h-2 w-2 rounded-full"></span> Mới:{' '}
                  {latestReading.currentValue?.toLocaleString()}
                </span>
              </div>

              <div className="mt-auto grid w-full grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <span className="mb-1 text-xs text-slate-500">Thành tiền</span>
                  <span className="font-semibold text-slate-900">{latestReading.amount?.toLocaleString()} ₫</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                  <span className="mb-1 text-xs text-slate-500">Trạng thái</span>
                  {getReadingStatusBadge(latestReading.status)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-slate-400">
              <span className="material-symbols-outlined mb-2 text-[48px] opacity-50">pending_actions</span>
              <p>Chưa có dữ liệu ghi chỉ số</p>
            </div>
          )}
        </div>

        {/* Sync Widget */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="material-symbols-outlined text-blue-500">sync</span>
              Đồng bộ tự động
            </h3>
          </div>
          <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
            <span className="material-symbols-outlined mb-3 text-[48px] text-slate-300">api</span>
            <h4 className="mb-1 font-medium text-slate-700">Chưa kết nối thiết bị IoT</h4>
            <p className="mb-4 max-w-sm text-sm text-slate-500">
              Công tơ này hiện đang ghi nhận thủ công. Kết nối với hệ thống IoT (Tuya, SmartLife...) để tự động đồng bộ
              chỉ số.
            </p>
            <Button variant="outline" size="sm">
              Cấu hình kết nối
            </Button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="material-symbols-outlined text-slate-500">history</span>
            Lịch sử ghi chỉ số
          </h3>
          <RecordReadingDialog>
            <Button size="sm" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Ghi Chỉ Số
            </Button>
          </RecordReadingDialog>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-semibold text-slate-500 uppercase">Tháng tính tiền</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Chỉ số cũ</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Chỉ số mới</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Tiêu thụ</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Đơn giá</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Thành tiền</TableHead>
                <TableHead className="text-center font-semibold text-slate-500 uppercase">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingReadings ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                    Đang tải lịch sử...
                  </TableCell>
                </TableRow>
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                    Chưa có lịch sử ghi chỉ số nào
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      {new Date(reading.billingMonth).toLocaleDateString('vi-VN', {
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {reading.previousValue?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {reading.currentValue?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {reading.consumption?.toLocaleString()} {meter.unit}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">{reading.unitPrice?.toLocaleString()} ₫</TableCell>
                    <TableCell className="text-right font-medium">{reading.amount?.toLocaleString()} ₫</TableCell>
                    <TableCell className="text-center">{getReadingStatusBadge(reading.status)}</TableCell>
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
