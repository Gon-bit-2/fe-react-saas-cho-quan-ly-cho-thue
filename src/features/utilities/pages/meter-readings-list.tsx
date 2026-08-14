import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMeterReadingsControllerList } from '../api'
import { RecordReadingDialog } from '../components/record-reading-dialog'

export function MeterReadingsListPage() {
  const [filters, setFilters] = useState<{
    page: number
    limit: number
    billingMonth?: string
    type?: 'ELECTRICITY' | 'WATER'
    status?: 'DRAFT' | 'CONFIRMED' | 'ABNORMAL' | 'REJECTED'
  }>({
    page: 1,
    limit: 10,
  })

  const { data: response, isLoading } = useMeterReadingsControllerList(filters)

  const readings = (response as unknown as { data?: Array<Record<string, any>> })?.data || []
  const total = (response as unknown as { meta?: { total?: number } })?.meta?.total || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Đã duyệt</Badge>
      case 'ABNORMAL':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bất thường</Badge>
      case 'REJECTED':
        return <Badge className="bg-slate-300 text-slate-800 hover:bg-slate-300">Đã từ chối</Badge>
      case 'DRAFT':
      default:
        return <Badge className="border border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100">Chờ duyệt</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    if (type === 'ELECTRICITY') return <span className="font-medium text-amber-600">Điện</span>
    return <span className="font-medium text-blue-600">Nước</span>
  }

  return (
    <div className="bg-background flex h-full min-h-[calc(100vh-64px)] w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Chỉ Số Điện Nước</h1>
          <p className="text-sm text-slate-500">Quản lý và ghi nhận chỉ số tiêu thụ tiện ích định kỳ.</p>
        </div>
        <RecordReadingDialog>
          <Button className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Ghi Chỉ Số
          </Button>
        </RecordReadingDialog>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Tháng tính tiền</label>
          <Input
            type="month"
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                billingMonth: e.target.value ? `${e.target.value}-01` : undefined,
                page: 1,
              }))
            }
          />
        </div>

        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Loại Tiện Ích</label>
          <Select
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                type: val === 'all' ? undefined : (val as 'ELECTRICITY' | 'WATER'),
                page: 1,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="ELECTRICITY">Điện</SelectItem>
              <SelectItem value="WATER">Nước</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Trạng thái</label>
          <Select
            onValueChange={(val) =>
              setFilters((prev) => ({
                ...prev,
                status: val === 'all' ? undefined : (val as 'DRAFT' | 'CONFIRMED' | 'ABNORMAL'),
                page: 1,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Chờ duyệt</SelectItem>
              <SelectItem value="CONFIRMED">Đã duyệt</SelectItem>
              <SelectItem value="ABNORMAL">Bất thường</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-500 uppercase">Tháng</TableHead>
                <TableHead className="font-semibold text-slate-500 uppercase">Phòng / Công Tơ</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Chỉ Số Cũ</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Chỉ Số Mới</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Tiêu Thụ</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Thành Tiền</TableHead>
                <TableHead className="text-center font-semibold text-slate-500 uppercase">Trạng Thái</TableHead>
                <TableHead className="text-right font-semibold text-slate-500 uppercase">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : readings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                    Không có bản ghi nào
                  </TableCell>
                </TableRow>
              ) : (
                readings.map((reading) => (
                  <TableRow key={reading.id} className="group hover:bg-slate-50">
                    <TableCell className="text-slate-500">
                      {new Date(reading.billingMonth).toLocaleDateString('vi-VN', {
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        {getTypeBadge(reading.meter?.type)}
                        <span className="text-slate-400">|</span>
                        Phòng {reading.room?.roomCode}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Mã CT:{' '}
                        <Link to={`/dien-nuoc/cong-to/${reading.meterId}`} className="text-primary hover:underline">
                          {reading.meter?.meterCode}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {reading.previousValue?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {reading.currentValue?.toLocaleString() || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {reading.consumption?.toLocaleString()} {reading.meter?.unit}
                    </TableCell>
                    <TableCell className="text-right font-medium">{reading.amount?.toLocaleString()} ₫</TableCell>
                    <TableCell className="text-center">{getStatusBadge(reading.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/dien-nuoc/cong-to/${reading.meterId}`}>
                            <DropdownMenuItem>
                              <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
                              Xem chi tiết công tơ
                            </DropdownMenuItem>
                          </Link>
                          {reading.status === 'DRAFT' && (
                            <DropdownMenuItem>
                              <span className="material-symbols-outlined mr-2 text-[18px]">check_circle</span>
                              Duyệt chỉ số
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="text-sm text-slate-500">
            Hiển thị {readings.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} đến{' '}
            {Math.min(filters.page * filters.limit, total)} trong số {total} mục
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={filters.page === 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              {filters.page}
            </Button>
            {total > filters.page * filters.limit && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
