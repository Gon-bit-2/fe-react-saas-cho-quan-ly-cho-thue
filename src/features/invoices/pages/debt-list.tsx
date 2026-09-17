import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { MetricCard } from '@/components/ui/metric-card'
import { useQuery } from '@tanstack/react-query'
import { getDebts } from '../api'
import { InvoiceStatus, type InvoiceListParams } from '../types'
import { formatCurrency, formatDate } from '@/shared/lib/utils'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Clock,
  ArrowLeft,
  Receipt,
  Search,
  User,
  DoorOpen,
  BellRing,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

/**
 * Trang Sổ theo dõi Công nợ người thuê.
 * Giúp chủ trọ phân loại nợ theo tuổi nợ (quá hạn > 30 ngày, 1-30 ngày) và đôn đốc nhắc nợ kịp thời.
 */
export function DebtListPage() {
  const [filters, setFilters] = useState<InvoiceListParams>({
    page: 1,
    limit: 10,
    status: InvoiceStatus.OVERDUE,
  })

  /**
   * Tải danh sách công nợ và thống kê tuổi nợ từ API qua TanStack Query (tránh cascading render)
   */
  const { data: debtsResponse, isLoading } = useQuery({
    queryKey: ['debts', filters],
    queryFn: async () => {
      const response = await getDebts(filters)
      return {
        ...response,
        fetchTime: Date.now(),
      }
    },
  })

  const debts = debtsResponse?.data || []
  const total = debtsResponse?.meta?.total || 0
  const stats = debtsResponse?.stats || {
    totalOutstanding: 0,
    overdueMoreThan30Days: 0,
    overdueWithin30Days: 0,
    currentNotDue: 0,
  }
  const currentTimestamp = debtsResponse?.fetchTime || 0

  const handleRemindAll = () => {
    toast.success('Đã gửi thông báo nhắc nợ hàng loạt tới tất cả khách quá hạn!')
  }

  const handleRemindSingle = (debtCode: string) => {
    toast.success(`Đã gửi thông báo nhắc nợ cho hóa đơn ${debtCode}`)
  }

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
            <Link to="/hoa-don">
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link to="/hoa-don" className="hover:text-blue-600">
                Hóa đơn
              </Link>
              <span>/</span>
              <span className="font-medium text-slate-900">Sổ công nợ</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Quản Lý Công Nợ Người Thuê</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRemindAll}
            className="h-9 gap-1.5 bg-rose-600 text-xs text-white shadow-xs hover:bg-rose-700"
          >
            <BellRing className="h-4 w-4" /> Nhắc nợ toàn bộ
          </Button>
        </div>
      </div>

      {/* Debt Aging KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Tổng công nợ tồn đọng"
          value={formatCurrency(stats.totalOutstanding)}
          description="Toàn bộ số tiền chưa thu hồi"
          icon={<Receipt className="h-5 w-5" />}
          tone="rose"
        />
        <MetricCard
          title="Quá hạn trên 30 ngày"
          value={formatCurrency(stats.overdueMoreThan30Days)}
          description="Nợ khó đòi, cần can thiệp trực tiếp"
          icon={<ShieldAlert className="h-5 w-5" />}
          tone="rose"
        />
        <MetricCard
          title="Quá hạn 1 - 30 ngày"
          value={formatCurrency(stats.overdueWithin30Days)}
          description="Nợ trễ hạn gần đây"
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
        <MetricCard
          title="Sắp tới hạn kỳ này"
          value={formatCurrency(stats.currentNotDue)}
          description="Hóa đơn chưa tới hạn chót"
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="blue"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo mã hóa đơn, tên người thuê..."
            className="h-9 bg-slate-50 pl-9 text-sm focus-visible:bg-white"
            value={filters.search || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* Table Debt Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="w-[180px]">Mã hóa đơn</TableHead>
                <TableHead>Khách thuê & Phòng</TableHead>
                <TableHead>Hạn nộp</TableHead>
                <TableHead className="text-center">Số ngày trễ</TableHead>
                <TableHead className="text-right">Tổng hóa đơn</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead className="text-right">Còn nợ</TableHead>
                <TableHead className="w-[140px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-36" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-5 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-24" />
                    </TableCell>
                  </TableRow>
                ))
              ) : debts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      icon={<Receipt className="h-7 w-7 text-emerald-500" />}
                      title="Không có công nợ quá hạn"
                      description="Tuyệt vời! Tất cả người thuê phòng đều đã hoàn thành đóng tiền đầy đủ."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                debts.map((debt) => {
                  const overdueDays =
                    debt.dueDate && currentTimestamp > 0
                      ? Math.max(
                          0,
                          Math.floor((currentTimestamp - new Date(debt.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
                        )
                      : 0
                  const isHighRisk = overdueDays > 30

                  return (
                    <TableRow key={debt.id} className="transition-colors hover:bg-slate-50/80">
                      <TableCell className="font-medium text-slate-900">
                        <Link to={`/hoa-don/${debt.invoiceId}`} className="font-semibold text-blue-600 hover:underline">
                          {debt.invoice?.invoiceCode || `HD-${debt.invoiceId}`}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span>{debt.renter?.fullName || 'Khách thuê'}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <DoorOpen className="h-3 w-3 text-slate-400" />
                          <span>Phòng {debt.room?.roomCode || debt.room?.title || 'Chưa gán'}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        {debt.dueDate ? formatDate(debt.dueDate) : '—'}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            isHighRisk
                              ? 'border-rose-200 bg-rose-50 font-bold text-rose-700'
                              : 'border-amber-200 bg-amber-50 text-amber-700'
                          }`}
                        >
                          Trễ {overdueDays} ngày
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-mono text-slate-600 tabular-nums">
                        {formatCurrency(debt.originalAmount || debt.invoice?.totalAmount || 0)}
                      </TableCell>

                      <TableCell className="text-right font-mono text-emerald-600 tabular-nums">
                        {formatCurrency(debt.paidAmount || 0)}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-rose-600 tabular-nums">
                        {formatCurrency(debt.remainingAmount || 0)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                            onClick={() => handleRemindSingle(debt.invoice?.invoiceCode || `HD-${debt.invoiceId}`)}
                            title="Gửi nhắc nợ"
                          >
                            <BellRing className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 gap-1 border-emerald-200 text-xs text-emerald-700 hover:bg-emerald-50"
                          >
                            <Link to={`/hoa-don/${debt.invoiceId}`}>
                              <CreditCard className="h-3.5 w-3.5" /> Thu nợ
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4 text-sm text-slate-500">
            <div>
              Hiển thị <span className="font-medium text-slate-700">{(filters.page! - 1) * filters.limit! + 1}</span> -{' '}
              <span className="font-medium text-slate-700">{Math.min(filters.page! * filters.limit!, total)}</span> trên
              tổng số <span className="font-medium text-slate-700">{total}</span> khoản nợ
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                disabled={filters.page === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trước
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
                {filters.page}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 px-2.5 text-xs"
                disabled={filters.page! * filters.limit! >= total}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
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
