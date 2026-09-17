import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { useServiceAssignments } from '@/shared/api/services'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { Plus, Link2, DoorOpen, Layers, ArrowLeft, Calendar } from 'lucide-react'

/**
 * Trang danh sách dịch vụ đã gán cho từng phòng trọ.
 * Giúp chủ trọ theo dõi phòng nào đang sử dụng dịch vụ gì và số lượng bao nhiêu.
 */
export default function AssignmentList() {
  const navigate = useNavigate()
  const { data, isLoading } = useServiceAssignments()

  const assignments = useMemo(() => data?.data || [], [data])

  // Thống kê số liệu gán
  const stats = useMemo(() => {
    const uniqueRooms = new Set(assignments.map((a) => a.roomId)).size
    const totalQuantity = assignments.reduce((sum, a) => sum + (Number(a.quantity) || 1), 0)
    return {
      totalAssignments: assignments.length,
      uniqueRooms,
      totalQuantity,
    }
  }, [assignments])

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white shadow-xs"
          >
            <Link to="/dich-vu">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/dich-vu" className="hover:text-blue-600">
                Dịch vụ
              </Link>
              <span>/</span>
              <span className="font-medium text-slate-900">Phân bổ phòng</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Dịch Vụ Đã Gán Cho Phòng</h1>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/dich-vu-da-gan/tao-moi')}
          className="h-9 gap-1.5 bg-blue-600 text-xs text-white shadow-xs hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Gán dịch vụ cho phòng
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          title="Tổng lượt gán dịch vụ"
          value={stats.totalAssignments}
          description="Bản ghi dịch vụ đang liên kết"
          icon={<Link2 className="h-5 w-5" />}
          tone="blue"
        />
        <MetricCard
          title="Số phòng đang dùng dịch vụ"
          value={stats.uniqueRooms}
          description="Phòng đã được thiết lập dịch vụ"
          icon={<DoorOpen className="h-5 w-5" />}
          tone="emerald"
        />
        <MetricCard
          title="Tổng số lượng tính phí"
          value={stats.totalQuantity}
          description="Lưu lượng xe, người hoặc phòng"
          icon={<Layers className="h-5 w-5" />}
          tone="purple"
        />
      </div>

      {/* Table Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow>
              <TableHead>Tên dịch vụ tiện ích</TableHead>
              <TableHead>Phòng áp dụng</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead className="text-right">Ngày gán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-5 w-12" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-5 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <EmptyState
                    icon={<Link2 className="h-7 w-7 text-slate-400" />}
                    title="Chưa có phòng nào được gán dịch vụ"
                    description="Gán các dịch vụ như Wifi, rác, gửi xe vào từng phòng trọ để tự động cộng dồn vào hóa đơn hàng tháng."
                    action={
                      <Button
                        size="sm"
                        onClick={() => navigate('/dich-vu-da-gan/tao-moi')}
                        className="h-9 gap-1.5 bg-blue-600 text-xs text-white hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4" /> Gán dịch vụ ngay
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-slate-50/80">
                  <TableCell className="font-medium text-slate-900">
                    <span className="font-semibold">{item.service?.name || `Dịch vụ #${item.serviceId}`}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <DoorOpen className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">Phòng {item.room?.roomCode || item.roomId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 font-mono text-xs text-blue-700">
                      x{item.quantity} {item.service?.unitLabel || ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-500 tabular-nums">
                    {item.assignedDate ? (
                      <span className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {new Date(item.assignedDate).toLocaleDateString('vi-VN')}
                      </span>
                    ) : (
                      '—'
                    )}
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
