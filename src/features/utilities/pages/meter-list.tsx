import { useState } from 'react'
import { Link } from 'react-router'
import { useUtilityMetersControllerList } from '@/shared/api/generated/utility-meters/utility-meters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CreateMeterDialog } from '../components/create-meter-dialog'

export function MeterListPage() {
  const [filters, setFilters] = useState<{
    page: number
    limit: number
    type?: 'ELECTRICITY' | 'WATER'
    search?: string
  }>({
    page: 1,
    limit: 10,
  })

  // Fetch meters
  const { data: response, isLoading } = useUtilityMetersControllerList(
    filters as unknown as Parameters<typeof useUtilityMetersControllerList>[0],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meters = (response as unknown as { data?: Array<any> })?.data || []
  const total = (response as unknown as { meta?: { total?: number } })?.meta?.total || 0

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách Công tơ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý toàn bộ công tơ điện, nước trong hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateMeterDialog />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex min-w-[300px] flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-slate-400">
              search
            </span>
            <Input
              placeholder="Tìm theo mã công tơ..."
              className="pl-10"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <Select
            value={filters.type || 'ALL'}
            onValueChange={(val) => handleFilterChange('type', val === 'ALL' ? undefined : val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="ELECTRICITY">Điện</SelectItem>
              <SelectItem value="WATER">Nước</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead className="w-[200px]">Mã công tơ</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phòng đang gắn</TableHead>
              <TableHead className="text-right">Chỉ số hiện tại</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                  <div className="mt-2">Đang tải dữ liệu...</div>
                </TableCell>
              </TableRow>
            ) : meters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Không tìm thấy dữ liệu công tơ nào.
                </TableCell>
              </TableRow>
            ) : (
              meters.map((meter) => (
                <TableRow key={meter.id} className="transition-colors hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex flex-col">
                      <span>{meter.meterCode}</span>
                      <span className="text-xs font-normal text-slate-500">
                        Thêm ngày {new Date(meter.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {meter.type === 'ELECTRICITY' ? (
                      <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                        <span className="material-symbols-outlined mr-1 text-[14px]">bolt</span> Điện
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        <span className="material-symbols-outlined mr-1 text-[14px]">water_drop</span> Nước
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        meter.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-100'
                      }
                    >
                      {meter.status === 'ACTIVE'
                        ? 'Đang hoạt động'
                        : meter.status === 'BROKEN'
                          ? 'Bị hỏng'
                          : 'Ngưng hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {meter.roomId ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">meeting_room</span>
                        <span className="font-medium">Phòng {meter.room?.roomCode || meter.roomId}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa gắn phòng</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-mono font-medium text-slate-900">
                      {meter.readings?.[0]?.currentValue ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <Link to={`/dien-nuoc/cong-to/${meter.id}`} className="flex cursor-pointer items-center">
                            <span className="material-symbols-outlined mr-2 text-[18px]">visibility</span>
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={`/dien-nuoc/chi-so?roomId=${meter.roomId || ''}`}
                            className="flex cursor-pointer items-center"
                          >
                            <span className="material-symbols-outlined mr-2 text-[18px]">history</span>
                            Lịch sử ghi
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

        {/* Pagination Dummy Placeholder */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm text-slate-500">
            <div>
              Hiển thị {(filters.page - 1) * filters.limit + 1} - {Math.min(filters.page * filters.limit, total)} trên
              tổng số {total} công tơ
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handleFilterChange('page', filters.page - 1)}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page * filters.limit >= total}
                onClick={() => handleFilterChange('page', filters.page + 1)}
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
